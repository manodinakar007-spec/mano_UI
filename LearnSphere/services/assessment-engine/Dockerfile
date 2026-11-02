# Build stage
FROM golang:1.21-alpine AS builder
WORKDIR /app
COPY go.mod ./
COPY src ./src
RUN go mod tidy
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o assessment-engine ./src/...

# Final stage
FROM alpine:3.19
WORKDIR /app
COPY --from=builder /app/assessment-engine .
EXPOSE 9103
CMD ["/app/assessment-engine"]
