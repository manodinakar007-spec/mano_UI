package main

import (
	"database/sql"
	"fmt"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
	_ "github.com/lib/pq"
)

var db *sql.DB

func main() {
	// Logger setup
	zerolog.TimeFieldFormat = time.RFC3339
	if os.Getenv("NODE_ENV") != "production" {
		log.Logger = log.Output(zerolog.ConsoleWriter{Out: os.Stderr})
	}

	// DB connection
	dbURL := getEnv("DATABASE_URL", "postgres://skillfyme:skillfyme_secret@localhost:5432/skillfyme?sslmode=disable")
	var err error
	db, err = sql.Open("postgres", dbURL)
	if err != nil {
		log.Fatal().Err(err).Msg("Failed to open database")
	}
	defer db.Close()

	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(5)
	db.SetConnMaxLifetime(5 * time.Minute)

	if err := db.Ping(); err != nil {
		log.Fatal().Err(err).Msg("Database ping failed")
	}
	log.Info().Msg("Connected to PostgreSQL")

	// Initialize schema
	if err := initSchema(); err != nil {
		log.Fatal().Err(err).Msg("Schema init failed")
	}

	// Router
	if os.Getenv("GIN_MODE") == "" {
		gin.SetMode(gin.ReleaseMode)
	}
	r := gin.New()
	r.Use(gin.Recovery())
	r.Use(requestLogger())
	r.Use(corsMiddleware())

	// Health
	r.GET("/health", healthHandler)

	// API routes
	v1 := r.Group("/api/v1")
	{
		assessments := v1.Group("/assessments")
		{
			assessments.GET("", listAssessments)
			assessments.POST("", createAssessment)
			assessments.GET("/:id", getAssessment)
			assessments.PATCH("/:id", updateAssessment)
		}

		attempts := v1.Group("/attempts")
		{
			attempts.POST("", startAttempt)
			attempts.GET("/:id", getAttempt)
			attempts.POST("/:id/submit", submitAttempt)
		}

		results := v1.Group("/results")
		{
			results.GET("/user/:userId", getUserResults)
			results.GET("/assessment/:assessmentId", getAssessmentResults)
		}
	}

	port := getEnv("PORT", "9103")
	log.Info().Str("port", port).Msg("Assessment Engine service started")
	if err := r.Run(fmt.Sprintf(":%s", port)); err != nil {
		log.Fatal().Err(err).Msg("Server failed")
	}
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func initSchema() error {
	_, err := db.Exec(`
		CREATE TABLE IF NOT EXISTS assessments (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			title VARCHAR(255) NOT NULL,
			description TEXT,
			course_id VARCHAR(100),
			type VARCHAR(50) NOT NULL DEFAULT 'quiz',
			level VARCHAR(50),
			duration_minutes INTEGER DEFAULT 60,
			passing_score INTEGER DEFAULT 70,
			max_attempts INTEGER DEFAULT 3,
			is_proctored BOOLEAN DEFAULT FALSE,
			is_published BOOLEAN DEFAULT FALSE,
			question_count INTEGER DEFAULT 0,
			created_at TIMESTAMP DEFAULT NOW(),
			updated_at TIMESTAMP DEFAULT NOW()
		);

		CREATE TABLE IF NOT EXISTS questions (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
			text TEXT NOT NULL,
			type VARCHAR(50) DEFAULT 'multiple_choice',
			options JSONB,
			correct_answer JSONB,
			explanation TEXT,
			points INTEGER DEFAULT 1,
			order_index INTEGER DEFAULT 0
		);

		CREATE TABLE IF NOT EXISTS attempts (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			assessment_id UUID REFERENCES assessments(id),
			user_id VARCHAR(100) NOT NULL,
			status VARCHAR(50) DEFAULT 'in_progress',
			answers JSONB DEFAULT '{}',
			score NUMERIC(5,2),
			passed BOOLEAN,
			started_at TIMESTAMP DEFAULT NOW(),
			submitted_at TIMESTAMP,
			time_spent_seconds INTEGER
		);

		CREATE INDEX IF NOT EXISTS idx_attempts_user ON attempts(user_id);
		CREATE INDEX IF NOT EXISTS idx_attempts_assessment ON attempts(assessment_id);
	`)
	return err
}
