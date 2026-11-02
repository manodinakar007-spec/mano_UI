import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Star, Clock, Users, Cloud, Code2, Database, Shield, Cpu, TrendingUp, Layers, CheckCircle, Play, ChevronDown, Globe, AlertCircle, Award, BookOpen } from 'lucide-react';
import { courseApi } from '../utils/api.js';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';

const LEVEL_BADGE = {
  beginner: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  intermediate: 'bg-amber-50 text-amber-700 border-amber-200',
  advanced: 'bg-rose-50 text-rose-700 border-rose-200',
};

const CATEGORY_THEME = {
  'Cloud & DevOps':      { grad: 'from-sky-500 via-blue-600 to-indigo-700',   icon: Cloud,      dot1: '#38bdf8', dot2: '#818cf8' },
  'Web Development':     { grad: 'from-violet-500 via-purple-600 to-fuchsia-700', icon: Code2,   dot1: '#a78bfa', dot2: '#f0abfc' },
  'Data Science':        { grad: 'from-emerald-500 via-teal-600 to-cyan-700',  icon: Database,   dot1: '#34d399', dot2: '#22d3ee' },
  'Security':            { grad: 'from-rose-500 via-red-600 to-orange-600',    icon: Shield,     dot1: '#fb7185', dot2: '#fb923c' },
  'Backend Development': { grad: 'from-amber-500 via-orange-500 to-yellow-600',icon: Cpu,        dot1: '#fbbf24', dot2: '#f97316' },
  'Product':             { grad: 'from-pink-500 via-rose-500 to-red-500',      icon: TrendingUp, dot1: '#f472b6', dot2: '#fb7185' },
  'default':             { grad: 'from-brand-500 via-brand-600 to-violet-700', icon: Layers,     dot1: '#6366f1', dot2: '#a78bfa' },
};

function CourseThumbnail({ category, title }) {
  const theme = CATEGORY_THEME[category] || CATEGORY_THEME['default'];
  const Icon = theme.icon;
  const initials = title
    ? title.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()
    : 'CS';

  return (
    <div className={`aspect-video bg-gradient-to-br ${theme.grad} rounded-xl mb-5 flex items-center justify-center overflow-hidden relative select-none`}>
      {/* decorative blobs */}
      <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full opacity-30"
        style={{ background: theme.dot1 }} />
      <div className="absolute -bottom-8 -left-4 w-36 h-36 rounded-full opacity-20"
        style={{ background: theme.dot2 }} />
      {/* grid dots pattern */}
      <div className="absolute inset-0 opacity-10"
        style={{ backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`, backgroundSize: '18px 18px' }} />
      {/* content */}
      <div className="relative z-10 flex flex-col items-center gap-2">
        <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
          <Icon className="h-7 w-7 text-white" />
        </div>
        <span className="text-white/90 text-xs font-semibold tracking-widest uppercase mt-1">
          {category || 'Course'}
        </span>
      </div>
      {/* initials watermark */}
      <span className="absolute bottom-3 right-4 text-white/10 font-black text-5xl leading-none select-none pointer-events-none">
        {initials}
      </span>
    </div>
  );
}

export default function CourseDetailPage() {
  const { courseId } = useParams();

  const { data: courseData, isLoading } = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => courseApi.get(courseId).then((r) => r.data),
    placeholderData: PLACEHOLDER_COURSE,
    retry: 1,
  });

  const course = courseData || PLACEHOLDER_COURSE;

  if (isLoading && !courseData) return <div className="flex justify-center py-24"><LoadingSpinner size="lg" /></div>;

  const level = course.level || 'intermediate';
  const totalLessons = (course.modules || PLACEHOLDER_MODULES).reduce((sum, m) => sum + (m.lessons || 0), 0);

  return (
    <div className="bg-white">
      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="text-brand-400 text-sm font-semibold uppercase tracking-wide">{course.category}</span>
              <span className="text-gray-600">·</span>
              <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border capitalize ${LEVEL_BADGE[level]}`}>
                {level}
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">{course.title}</h1>
            <p className="text-gray-300 leading-relaxed mb-6 text-base">{course.description}</p>

            {/* Meta stats */}
            <div className="flex flex-wrap items-center gap-5 text-sm mb-5">
              {course.rating && (
                <span className="flex items-center gap-1.5 text-yellow-400 font-bold">
                  <Star className="h-4 w-4 fill-current" />
                  {course.rating}
                  <span className="text-gray-400 font-normal ml-0.5">({course.reviewCount?.toLocaleString()} reviews)</span>
                </span>
              )}
              <span className="flex items-center gap-1.5 text-gray-300">
                <Users className="h-4 w-4 text-gray-500" />
                {course.enrolledCount?.toLocaleString()} enrolled
              </span>
              <span className="flex items-center gap-1.5 text-gray-300">
                <Clock className="h-4 w-4 text-gray-500" />
                {course.durationHours}h total
              </span>
              <span className="flex items-center gap-1.5 text-gray-300">
                <BookOpen className="h-4 w-4 text-gray-500" />
                {totalLessons} lessons
              </span>
              <span className="flex items-center gap-1.5 text-gray-300">
                <Globe className="h-4 w-4 text-gray-500" />
                {course.language || 'English'}
              </span>
            </div>

            <p className="text-gray-400 text-sm">
              Created by{' '}
              <span className="text-brand-400 font-semibold hover:text-brand-300 cursor-pointer transition-colors">
                {course.instructor?.name}
              </span>
            </p>

            <p className="text-gray-500 text-xs mt-2">Last updated: June 2025</p>
          </div>

          {/* Enrollment Card */}
          <div className="lg:col-span-1">
            <div className="bg-white text-gray-900 rounded-2xl shadow-2xl p-6 sticky top-24">
              <CourseThumbnail category={course.category} title={course.title} />

              <div className="flex items-end gap-2 mb-1">
                <p className="text-3xl font-extrabold text-gray-900">
                  {course.price === 0 ? 'Free' : `$${course.price}`}
                </p>
                {course.price > 0 && (
                  <p className="text-gray-400 line-through text-sm mb-1">${(course.price * 1.5).toFixed(2)}</p>
                )}
              </div>
              {course.price > 0 && (
                <p className="text-xs text-rose-600 font-semibold mb-3">33% off — 2 days left at this price!</p>
              )}

              <Link
                to={`/enroll/${courseId}`}
                className="btn-primary w-full text-center text-base py-3 mt-2 mb-3 block"
              >
                {course.price === 0 ? 'Enroll for Free' : 'Add to Cart'}
              </Link>
              <p className="text-xs text-gray-400 text-center mb-5">30-day money-back guarantee · No questions asked</p>

              <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-3">This course includes:</p>
              <ul className="space-y-2.5 text-sm text-gray-600">
                <li className="flex items-center gap-2.5"><CheckCircle className="h-4 w-4 text-green-500 shrink-0" /> {course.durationHours}h on-demand video</li>
                <li className="flex items-center gap-2.5"><CheckCircle className="h-4 w-4 text-green-500 shrink-0" /> {totalLessons} lessons with exercises</li>
                <li className="flex items-center gap-2.5"><CheckCircle className="h-4 w-4 text-green-500 shrink-0" /> Downloadable resources & code</li>
                <li className="flex items-center gap-2.5"><CheckCircle className="h-4 w-4 text-green-500 shrink-0" /> Full lifetime access</li>
                <li className="flex items-center gap-2.5"><CheckCircle className="h-4 w-4 text-green-500 shrink-0" /> Access on mobile, tablet & desktop</li>
                <li className="flex items-center gap-2.5"><Award className="h-4 w-4 text-brand-500 shrink-0" /> Certificate of completion</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-12">

          {/* What You'll Learn */}
          <section className="border border-gray-200 rounded-2xl p-7">
            <h2 className="text-xl font-bold text-gray-900 mb-5">What you'll learn</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {(course.learningOutcomes || PLACEHOLDER_OUTCOMES).map((outcome, i) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-brand-600 shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700 leading-snug">{outcome}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Requirements */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-5">Requirements</h2>
            <ul className="space-y-3">
              {(course.requirements || PLACEHOLDER_REQUIREMENTS).map((req, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                  <AlertCircle className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Course Curriculum */}
          <section>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-gray-900">Course Curriculum</h2>
              <span className="text-sm text-gray-500">{(course.modules || PLACEHOLDER_MODULES).length} sections · {totalLessons} lessons · {course.durationHours}h total</span>
            </div>
            <div className="border border-gray-200 rounded-2xl divide-y divide-gray-100 overflow-hidden">
              {(course.modules || PLACEHOLDER_MODULES).map((module, i) => (
                <details key={i} className="group" open={i === 0}>
                  <summary className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors list-none">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="shrink-0 w-7 h-7 rounded-lg bg-brand-50 text-brand-700 text-xs font-bold flex items-center justify-center">{i + 1}</span>
                      <div className="min-w-0">
                        <span className="font-semibold text-gray-900 text-sm">{module.title}</span>
                        <span className="text-xs text-gray-400 ml-2">{module.lessons} lessons · {module.duration}</span>
                      </div>
                    </div>
                    <ChevronDown className="h-4 w-4 text-gray-400 group-open:rotate-180 transition-transform shrink-0 ml-2" />
                  </summary>
                  <div className="px-5 pb-4 bg-gray-50 space-y-1">
                    {module.topics?.map((topic, j) => (
                      <div key={j} className="flex items-center gap-3 text-sm text-gray-600 py-1.5 border-b border-gray-100 last:border-0">
                        <Play className="h-3.5 w-3.5 text-brand-400 shrink-0" />
                        <span>{topic}</span>
                      </div>
                    ))}
                  </div>
                </details>
              ))}
            </div>
          </section>

          {/* Instructor */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-5">Your Instructor</h2>
            <div className="flex items-start gap-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-400 to-violet-500 flex items-center justify-center text-white text-2xl font-bold shrink-0">
                {course.instructor?.name?.charAt(0) || 'P'}
              </div>
              <div>
                <p className="font-bold text-gray-900 text-lg">{course.instructor?.name || 'Priya Mehta'}</p>
                <p className="text-brand-600 text-sm font-medium mb-3">Senior Cloud Architect & DevOps Lead</p>
                <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-3">
                  <span className="flex items-center gap-1.5"><Star className="h-3.5 w-3.5 text-yellow-400 fill-current" /> 4.8 instructor rating</span>
                  <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> 42,000+ students</span>
                  <span className="flex items-center gap-1.5"><BookOpen className="h-3.5 w-3.5" /> 8 courses</span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {course.instructor?.name || 'Priya Mehta'} is a seasoned cloud architect with 12+ years of experience designing
                  large-scale distributed systems at Fortune 500 companies. She has led engineering teams at Google Cloud and AWS,
                  and holds certifications in CKA, AWS Solutions Architect, and GCP Professional Cloud Architect.
                  Her teaching style emphasizes real-world production scenarios over toy examples.
                </p>
              </div>
            </div>
          </section>

        </div>

        {/* Right sidebar — hidden on mobile (card is in hero) */}
        <div className="hidden lg:block lg:col-span-1" />
      </div>
    </div>
  );
}

const PLACEHOLDER_REQUIREMENTS = [
  'Basic understanding of Linux command line (file navigation, permissions)',
  'Familiarity with any programming language (Python, Go, or JavaScript preferred)',
  'A computer with at least 8 GB RAM to run local Kubernetes clusters (Docker Desktop or Minikube)',
  'No prior Kubernetes or Docker experience required — we start from the fundamentals',
  'An AWS, GCP, or Azure free-tier account for cloud lab exercises (setup guide included)',
];

const PLACEHOLDER_OUTCOMES = [
  'Design and deploy production-grade microservice architectures on Kubernetes',
  'Implement fully automated CI/CD pipelines with GitHub Actions & ArgoCD',
  'Apply distributed systems patterns: circuit breaker, saga, CQRS, and event sourcing',
  'Configure Istio service mesh for observability, mTLS, and traffic management',
  'Monitor and alert with Prometheus, Grafana, Loki, and distributed tracing (Jaeger)',
  'Secure microservices with RBAC, OPA policies, and secrets management (Vault)',
  'Autoscale workloads with HPA, VPA, and KEDA event-driven autoscaling',
  'Reduce cloud costs with spot instances, resource quotas, and cost allocation tags',
];

const PLACEHOLDER_MODULES = [
  {
    title: 'Introduction to Cloud-Native Development',
    lessons: 6, duration: '2h 30m',
    topics: ['What is Cloud-Native and Why It Matters', 'The 12-Factor App Methodology', 'Containers vs Virtual Machines', 'Kubernetes Architecture Deep Dive', 'Setting Up Your Local Lab Environment'],
  },
  {
    title: 'Containerization with Docker',
    lessons: 9, duration: '3h 45m',
    topics: ['Writing Lean, Production-Ready Dockerfiles', 'Multi-Stage Builds for Smaller Images', 'Docker Compose for Local Development', 'Container Security & Image Scanning', 'Publishing to Container Registries (ECR, GCR, GHCR)'],
  },
  {
    title: 'Kubernetes Core Concepts',
    lessons: 14, duration: '5h 30m',
    topics: ['Pods, ReplicaSets & Deployments', 'Services, Ingress & DNS', 'ConfigMaps & Secrets Management', 'Persistent Volumes & StatefulSets', 'Horizontal & Vertical Pod Autoscaling', 'Namespaces, RBAC & Network Policies'],
  },
  {
    title: 'CI/CD & GitOps Pipelines',
    lessons: 10, duration: '4h 00m',
    topics: ['GitHub Actions: Build, Test & Publish', 'ArgoCD for GitOps Continuous Delivery', 'Blue-Green & Canary Deployments', 'Rollback Strategies & Release Gating', 'Secrets in CI/CD with Vault & Sealed Secrets'],
  },
  {
    title: 'Observability, Security & Cost Optimization',
    lessons: 11, duration: '4h 15m',
    topics: ['Prometheus Metrics & Custom Dashboards', 'Distributed Tracing with Jaeger & OpenTelemetry', 'Centralized Logging with Loki & Grafana', 'Istio Service Mesh: mTLS & Traffic Shaping', 'FinOps: Kubecost, Spot Nodes & Right-Sizing'],
  },
];

const PLACEHOLDER_COURSE = {
  id: '1',
  title: 'Cloud-Native Architecture with Kubernetes',
  category: 'Cloud & DevOps',
  level: 'intermediate',
  description: 'Master the full cloud-native stack — from writing production Dockerfiles to managing multi-cluster Kubernetes environments at scale. Built on real-world scenarios from Google Cloud, AWS, and Azure deployments.',
  instructor: { name: 'Priya Mehta' },
  rating: 4.8,
  reviewCount: 2341,
  durationHours: 24,
  enrolledCount: 18500,
  price: 79.99,
  language: 'English',
};
