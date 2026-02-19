# Marketing Homepage — PRD

## Objective
Communicate value fast, enable a single course introduction video, and drive conversion to paid access.

## Audience
Aspiring DevOps engineers, IT pros transitioning, junior devs.

## Primary Actions
- **Start Free Preview** (primary)
- **Unlock Full Course** (secondary)

## Page Structure

### Hero
- **H1:** "Launch your DevOps career with hands-on training"
- **Subhead:** "Learn Git, Docker, Kubernetes, Helm Charts, Ansible, CI/CD, Terraform, and Cloud basics with guided, real-world exercises."
- **CTAs:** [Start Free Preview], [Unlock Full Course]
- **Optional:** Short trust line below CTAs, e.g. "No credit card required for preview · Join thousands of learners"

### Value Props (3–4)
- **Hands-on labs** — Practice in real environments, not just theory. Run commands, build pipelines, deploy to cloud.
- **Real-world Projects** — Apply Git, Docker, Kubernetes, Helm Charts, Terraform, and CI/CD in project-based labs that mirror industry workflows.
- **Structured path** — From basics to deployment in a clear, step-by-step curriculum. No guesswork.
- **Track progress** — See what you’ve completed and what’s next. Pick up where you left off.

**Features section styling (professional):**
- **Section:** Clear section title with optional subtitle; subtle background (e.g. muted/10) or light border-top for separation; generous padding.
- **Cards:** Bordered cards (1px border), rounded corners (e.g. rounded-xl), soft shadow (shadow-sm). Hover: slightly elevated shadow and subtle border accent for interactivity.
- **Icons:** Larger icon container (e.g. 48px), rounded-lg or rounded-xl, distinct background (primary/10 or gradient). Icon in primary or foreground color.
- **Typography:** Card title font-semibold, readable size; description text smaller, muted, with comfortable line-height (leading-relaxed).
- **Layout:** Responsive grid (1 col mobile, 2 col tablet, 4 col desktop); even spacing (gap-6 or gap-8); cards equal height.
- **Optional:** Numbered badges (01–04), or a short accent line under the section heading.

### Testimonials
- **Structure:** Quote, name, role/title, optional avatar placeholder.
- **Placeholder content (until real testimonials):**
  - "Finally a course that lets me actually do the work, not just watch." — Alex T., DevOps Engineer
  - "The Terraform and Kubernetes sections got me production-ready in weeks." — Jordan M., Platform Engineer
  - "Clear path from zero to deploying real apps. Worth every penny." — Sam K., Backend Developer

### How it Works (5-step)
1. **Start free** — Sign up and start the free preview. No credit card required.
2. **Learn by doing** — Complete guided labs at your own pace. Practice in real environments.
3. **Unlock when ready** — Get full access to all modules, projects, and updates.
4. **Lifetime access** — One-time purchase includes future course updates and support.
5. **Apply it** — Use your skills in real projects and interviews.

### FAQ (3–5)
1. **What’s included in the free preview?** — You get access to one course introduction video so you can see the format and content before buying.
2. **How do I unlock the full course?** — Click “Unlock Full Course” to go to pricing and complete checkout. You’ll get immediate access after payment.
3. **Do I need prior DevOps experience?** — No. The course is designed for beginners and people transitioning into DevOps from development or IT.
4. **What if I get stuck?** — Each lesson includes clear instructions and hints. Support is available for enrolled students.
5. **Is there a refund policy?** — Yes. We offer a 30-day money-back guarantee if the course isn’t right for you.

### Footer
- **Links:** Terms, Privacy, Support
- **Copyright:** © [Year] DevOps Launchpad. All rights reserved.

## Copy Hooks
- **Hero H1:** Practical DevOps training for beginners
- **Subhead:** Build real skills with guided labs in Git, Docker, Kubernetes, Helm Charts, Terraform, Ansible, CI/CD, and Cloud Basics.
- **CTA:** Start free preview

## Course Introduction Video
- **Single video only:** One course introduction video, accessible without enrollment.
- **Player:** Hides gated actions; inline upgrade CTA to unlock full course.

## Payments Integration
- Unlock Full Course CTA → pricing/checkout (pricing shown there); Stripe Checkout.
- Success/Cancel return URLs configured.

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
- Start Free Preview opens the single course introduction video
- Unlock Full Course opens Stripe Checkout
- Analytics events fire on CTA clicks
- SEO tags present; basic lighthouse performance > 85
- Testimonials section shows at least 3 placeholder quotes
- How it Works shows 5 numbered steps
- FAQ has at least 5 questions
