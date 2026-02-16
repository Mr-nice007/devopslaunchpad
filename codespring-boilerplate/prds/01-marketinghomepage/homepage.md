# Marketing Homepage — PRD

## Objective
Communicate value fast, enable free lesson previews, and drive conversion to paid access.

## Audience
Aspiring DevOps engineers, IT pros transitioning, junior devs.

## Primary Actions
- **Start Free Preview** (primary)
- **Unlock Full Course** (secondary)

## Page Structure

### Hero
- **H1:** "Launch your DevOps career with hands-on training"
- **Subhead:** "Learn Git, Docker, Kubernetes, Ansible, CI/CD, Terraform, and cloud with guided, real-world exercises."
- **CTAs:** [Start Free Preview], [Unlock Full Course]

### Value Props (3–4)
Hands-on labs, Real-world Projects, Structured path, Track progress

### Course Overview
- Modules: Git, Docker, Kubernetes, Terraform, Ansible, CI/CD, Cloud Basics.
- Free preview badges on select lessons

### Testimonials (placeholder)

### How it Works (5-step)

### Pricing (simple)

### FAQ (3–5)

### Footer
Terms, Privacy, Support

## Copy Hooks
- **Hero H1:** Practical DevOps training for beginners
- **Subhead:** Build real skills with guided labs in Git, Docker, Kubernetes, Terraform, Ansible, CI/CD, and cloud.
- **CTA:** Start free preview

## Free Preview Requirements
- Lesson-level preview flag; accessible without enrollment
- Preview player hides gated actions; inline upgrade CTA

## Payments Integration
- Unlock CTA → Stripe Checkout
- Success/Cancel return URLs configured

## Analytics
- `cta_start_preview`, `cta_unlock_full_course` events

## SEO
- Title, meta description, OG tags
- sitemap.xml, robots.txt

## Performance
- next/image for hero/illustrations
- Lazy-load below the fold

## Acceptance Criteria
- Hero renders with two CTAs; responsive on mobile/desktop
- Course overview lists modules and marks preview lessons
- Start Free Preview navigates to working preview lesson
- Unlock Full Course opens Stripe Checkout
- Analytics events fire on CTA clicks
- SEO tags present; basic lighthouse performance > 85
