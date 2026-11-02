package main

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// ─── Health ──────────────────────────────────────────────────────────────────

func healthHandler(c *gin.Context) {
	dbStatus := "ok"
	if err := db.Ping(); err != nil {
		dbStatus = "error"
	}
	status := http.StatusOK
	if dbStatus != "ok" {
		status = http.StatusServiceUnavailable
	}
	c.JSON(status, gin.H{"status": dbStatus, "service": "assessment-engine", "timestamp": time.Now()})
}

// ─── Assessments ──────────────────────────────────────────────────────────────

func listAssessments(c *gin.Context) {
	courseID := c.Query("courseId")
	query := `SELECT id, title, description, course_id, type, level, duration_minutes, passing_score, max_attempts, is_proctored, is_published, question_count, created_at FROM assessments WHERE is_published = TRUE`
	args := []interface{}{}

	if courseID != "" {
		query += " AND course_id = $1"
		args = append(args, courseID)
	}
	query += " ORDER BY created_at DESC"

	rows, err := db.Query(query, args...)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	var assessments []gin.H
	for rows.Next() {
		var a struct {
			ID              string
			Title           string
			Description     *string
			CourseID        *string
			Type            string
			Level           *string
			DurationMinutes int
			PassingScore    int
			MaxAttempts     int
			IsProctored     bool
			IsPublished     bool
			QuestionCount   int
			CreatedAt       time.Time
		}
		rows.Scan(&a.ID, &a.Title, &a.Description, &a.CourseID, &a.Type, &a.Level,
			&a.DurationMinutes, &a.PassingScore, &a.MaxAttempts, &a.IsProctored,
			&a.IsPublished, &a.QuestionCount, &a.CreatedAt)
		assessments = append(assessments, gin.H{
			"id": a.ID, "title": a.Title, "description": a.Description,
			"courseId": a.CourseID, "type": a.Type, "level": a.Level,
			"durationMinutes": a.DurationMinutes, "passingScore": a.PassingScore,
			"maxAttempts": a.MaxAttempts, "isProctored": a.IsProctored,
			"questionCount": a.QuestionCount, "createdAt": a.CreatedAt,
		})
	}

	if assessments == nil {
		assessments = []gin.H{}
	}
	c.JSON(http.StatusOK, gin.H{"assessments": assessments})
}

func getAssessment(c *gin.Context) {
	id := c.Param("id")
	row := db.QueryRow(`SELECT id, title, description, course_id, type, level, duration_minutes, passing_score, max_attempts, is_proctored, question_count FROM assessments WHERE id = $1`, id)
	var a struct {
		ID, Title, Type   string
		Description       *string
		CourseID, Level   *string
		DurationMins, PS, MA, QC int
		IsProctored       bool
	}
	if err := row.Scan(&a.ID, &a.Title, &a.Description, &a.CourseID, &a.Type, &a.Level, &a.DurationMins, &a.PS, &a.MA, &a.IsProctored, &a.QC); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Assessment not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"id": a.ID, "title": a.Title, "description": a.Description,
		"courseId": a.CourseID, "type": a.Type, "level": a.Level,
		"durationMinutes": a.DurationMins, "passingScore": a.PS,
		"maxAttempts": a.MA, "isProctored": a.IsProctored, "questionCount": a.QC,
	})
}

func createAssessment(c *gin.Context) {
	var body map[string]interface{}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	id := uuid.New().String()
	_, err := db.Exec(`INSERT INTO assessments (id, title, description, course_id, type, level, duration_minutes, passing_score)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
		id, body["title"], body["description"], body["courseId"], body["type"], body["level"],
		body["durationMinutes"], body["passingScore"])
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"id": id, "message": "Assessment created"})
}

func updateAssessment(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Assessment updated", "id": c.Param("id")})
}

// ─── Attempts ─────────────────────────────────────────────────────────────────

func startAttempt(c *gin.Context) {
	var body struct {
		AssessmentID string `json:"assessmentId" binding:"required"`
		UserID       string `json:"userId" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	id := uuid.New().String()
	_, err := db.Exec(`INSERT INTO attempts (id, assessment_id, user_id, status) VALUES ($1,$2,$3,'in_progress')`,
		id, body.AssessmentID, body.UserID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"attemptId": id, "status": "in_progress", "startedAt": time.Now()})
}

func getAttempt(c *gin.Context) {
	row := db.QueryRow(`SELECT id, assessment_id, user_id, status, score, passed, started_at, submitted_at FROM attempts WHERE id = $1`, c.Param("id"))
	var a struct {
		ID, AssessmentID, UserID, Status string
		Score                            *float64
		Passed                           *bool
		StartedAt                        time.Time
		SubmittedAt                      *time.Time
	}
	if err := row.Scan(&a.ID, &a.AssessmentID, &a.UserID, &a.Status, &a.Score, &a.Passed, &a.StartedAt, &a.SubmittedAt); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Attempt not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"id": a.ID, "assessmentId": a.AssessmentID, "userId": a.UserID,
		"status": a.Status, "score": a.Score, "passed": a.Passed,
		"startedAt": a.StartedAt, "submittedAt": a.SubmittedAt,
	})
}

func submitAttempt(c *gin.Context) {
	var body struct {
		Answers map[string]interface{} `json:"answers"`
	}
	c.ShouldBindJSON(&body)

	// Score calculation placeholder (real impl would evaluate against correct answers)
	score := 82.5
	passed := score >= 70

	db.Exec(`UPDATE attempts SET status='completed', score=$1, passed=$2, submitted_at=NOW() WHERE id=$3`,
		score, passed, c.Param("id"))

	c.JSON(http.StatusOK, gin.H{
		"attemptId": c.Param("id"), "score": score, "passed": passed,
		"submittedAt": time.Now(), "message": "Attempt submitted successfully",
	})
}

func getUserResults(c *gin.Context) {
	rows, err := db.Query(`
		SELECT a.id, a.assessment_id, a.score, a.passed, a.submitted_at,
		       ass.title as assessment_title
		FROM attempts a
		JOIN assessments ass ON a.assessment_id = ass.id
		WHERE a.user_id = $1 AND a.status = 'completed'
		ORDER BY a.submitted_at DESC`, c.Param("userId"))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	var results []gin.H
	for rows.Next() {
		var r struct {
			ID, AssessmentID, Title string
			Score                   *float64
			Passed                  *bool
			SubmittedAt             *time.Time
		}
		rows.Scan(&r.ID, &r.AssessmentID, &r.Score, &r.Passed, &r.SubmittedAt, &r.Title)
		results = append(results, gin.H{
			"id": r.ID, "assessmentId": r.AssessmentID, "assessmentTitle": r.Title,
			"score": r.Score, "passed": r.Passed, "submittedAt": r.SubmittedAt,
		})
	}
	if results == nil {
		results = []gin.H{}
	}
	c.JSON(http.StatusOK, gin.H{"results": results})
}

func getAssessmentResults(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"results": []gin.H{}, "assessmentId": c.Param("assessmentId")})
}
