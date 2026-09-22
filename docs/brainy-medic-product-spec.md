# Brainy Medic — Mentor-Led Daily Practice Platform

**Product specification and customisation ideas**
Version 0.4 · September 2026 · Draft for admin review
Change in 0.4: renamed to Brainy Medic (BNM), Owner becomes Admin, a Parent Portal, the 90-day challenge on each student's own Day N with Sundays counting, admin-authored tasks with mentors verifying only, mentor reports and profiles, manual add for mentors and students, mentor photos, and rankings across roles (section 15).
Change in 0.2: students are enrolled by their mentor from an Excel sheet, not by the owner.

---

## 1. Vision

Brainy Medic is a single-educator learning platform where every student belongs to one mentor and one batch. Each day the mentor assigns one task. The student completes it, sees how they compare with the rest of their batch, uploads proof if the work was done on paper, and the mentor ticks it off. Doing this every day builds a streak, and every step earns points.

The product's job is to make that daily loop **effortless for students, fast for mentors, and visible for the owner**.

---

## 2. Roles and access

| Role | Who | What they see |
|---|---|---|
| **Owner (Admin)** | The educator who runs Brainy Medic | Everything: all mentors, batches, students, settings and reports |
| **Mentor** | A teacher responsible for one batch | Only their own batch of up to 50 students |
| **Student** | A learner enrolled by their mentor from an Excel sheet | Only their own mentor, their own batch, and their own data |

Access rules:

- A student can never see, or be seen by, another batch. Leaderboards, analysis and rankings are always scoped to the student's own batch.
- A mentor cannot see another mentor's students. Only the owner can compare batches.
- These rules are enforced at the database level (row-level security), not only in the interface, so they hold even if someone tampers with the app.

---

## 3. Login and onboarding

### Student (enrolled by their mentor)

Students do not sign themselves up. Their mentor enrols them by uploading an Excel sheet.

1. The mentor opens **Add students** in their dashboard and downloads the Excel template. Columns: **Name, Phone, Email**. Optional columns: exam target, city.
2. The mentor fills the sheet and uploads it (`.xlsx` or `.csv`). A quick **Add one student** form covers the odd single addition.
3. Before anything is saved, every row is validated: required fields present, valid email, 10-digit phone, no duplicates within the sheet, no student already enrolled anywhere in Brainy Medic (matched on email or phone), and seats remaining in the batch.
4. A preview shows each row as **ready**, **needs a fix** (with the reason), or **will be skipped**. The mentor corrects rows inline or re-uploads, then confirms.
5. On confirm, each enrolled student gets a unique Student ID, for example `BM-2026-0143`, is placed in the mentor's batch, and receives a welcome email containing their Student ID, their mentor's name and a one-tap login link. An optional WhatsApp copy of the same message goes to the phone number.
6. Login is passwordless: enter the Student ID, receive a 6-digit code by email, enter the code. There are no passwords to forget and no reset flows to support. An optional "set a password" can be added later for students who prefer it.
7. First login walks the student through a short setup: profile photo, exam target, preferred reminder time.
8. The mentor's roster shows an activation status for every student, **Invited** or **Active**, with a one-tap **Resend invite** for anyone who has not logged in yet.

### Mentor

1. The owner invites a mentor by email.
2. The mentor sets a password on first login (email + password, with an email OTP fallback).
3. A new mentor's batch starts empty and fills automatically as students enrol.

### Owner

Email + password with a mandatory second factor (OTP by email), since this account controls everything.

---

## 4. Batch membership and the 50-seat limit

Rule: each mentor holds at most **50 students**.

Because mentors enrol their own students, assignment is automatic by construction: every student in a mentor's sheet lands in that mentor's batch. The system's job is to protect the limit and prevent duplicates.

1. The **Add students** screen always shows seats remaining, for example "38 of 50 seats filled, 12 left", before the mentor uploads anything.
2. If a sheet contains more valid rows than seats, the mentor chooses which rows to enrol within the limit. The remaining rows are held in a **waiting list** visible to the owner.
3. The owner places waiting students with another mentor who has room, or adds a new mentor. Nothing is lost, and no mentor can exceed 50.
4. Enrolment is one student, one batch. A phone number or email already enrolled under any mentor is rejected at upload with a clear message, so the same student can never appear in two batches.

The owner can transfer a student between batches at any time; the student's history moves with them.

---

## 5. The daily task loop

This is the heart of the product. Every step has one clear owner and one clear next action.

```
Mentor assigns  →  Student takes test  →  Instant analysis  →  Student uploads proof (manual tests)  →  Mentor ticks  →  Streak + points
```

### 5.1 Mentor assigns (morning)

The mentor picks a task type:

- **In-app test.** MCQs generated by AI from uploaded material (already built), pulled from the question bank, or written by hand. Auto-graded.
- **Manual test.** Pen and paper. The mentor attaches the question paper (PDF or image); the student uploads a photo of the answer sheet when done.
- **Assignment / reading.** No test, only a proof upload (notes, a written summary).

The mentor sets a deadline (default 11:59 PM IST the same day) and a point value (defaults pre-filled). One tap publishes the task to all students in the batch; each gets a notification and an email. Tasks can be scheduled in advance for the whole week and saved as templates.

### 5.2 Student completes the task

- The home screen shows exactly one thing: **Today's task**, with a countdown to the deadline.
- In-app tests run in a distraction-free mode with a timer and the existing difficulty selector (Easy → Extreme).
- Manual tests show the paper, a **Start** button that logs the start time, and a **Done, upload answer sheet** button that opens the camera.

### 5.3 Instant analysis (after submission)

For the student:

- Score, batch rank, percentile and batch average.
- Topic-wise accuracy with the two weakest topics highlighted.
- Per-question review with explanations.
- A one-line AI summary, e.g. "You lost most marks on Fundamental Rights. Revise Articles 12 to 35 before tomorrow."

For the mentor:

- Submissions so far vs. batch size, live.
- Score distribution and the questions most students got wrong.
- The list of students who have not submitted, with a one-tap **Remind** button.

For manual tests, analysis appears once the mentor enters marks during verification.

### 5.4 Proof upload

- Mobile-first camera capture with multi-page support and automatic compression.
- Stored privately; only the student, their mentor and the owner can open it.
- Optional AI pre-check flags blank pages, wrong-task uploads or unreadable photos before the mentor sees them.

### 5.5 Mentor ticks

- A **Verification inbox** lists pending uploads as cards: photo on the left, tick / send back on the right, with quick marks entry for manual tests.
- **Send back** requires a short reason and reopens the task for the student until the deadline (or a grace window).
- Target: a mentor clears 50 verifications in under 15 minutes.

---

## 6. Streaks

- A streak day is earned when the student **submits** the task before the deadline. Verification is not required for the streak, so a slow mentor never breaks a student's streak. Verification unlocks the points instead.
- Days with no task assigned (for example Sunday) do not break the streak.
- Missing a deadline breaks the streak unless the student uses a **streak freeze**. Each student earns one freeze per 7-day streak (capped at two banked), so consistent students get protection and inconsistent ones do not.
- A mentor can **excuse** a day (illness, school exams), which preserves the streak. Excuses are visible to the owner.
- Milestones at 7, 21, 50, 100 and 365 days trigger a badge, a points bonus and a shout-out in the batch feed.
- Streaks are computed nightly by a scheduled job just after the deadline, never on the student's device.

---

## 7. Points and gamification

Suggested economy. Every value is configurable by the owner.

| Action | Points |
|---|---|
| Submit today's task before the deadline | 10 |
| Score bonus (auto-graded or mentor-marked) | up to 10, proportional to percentage |
| Upload proof | 5 |
| Mentor verifies the task | 5 |
| Submit before 6 PM ("early bird") | 2 |
| Rank 1 / 2 / 3 in the batch for the day | 15 / 10 / 5 |
| Streak milestone 7 / 21 / 50 / 100 days | 50 / 100 / 250 / 500 |
| Perfect week (every task submitted on time) | 25 |

Layers on top of points:

- **Levels.** Rookie → Learner → Scholar → Topper → Legend, based on lifetime points. The level shows next to the student's name everywhere.
- **Badges.** First upload, first rank 1, 7-day streak, comeback (streak rebuilt after breaking), most improved of the week.
- **Leaderboards.** Weekly and all-time, always within the batch. Weekly resets keep newcomers motivated.
- **Rewards catalogue** (owner-defined). Points can be redeemed for a certificate, a one-on-one doubt session, a shout-out, or a streak freeze.

Keep it healthy: show numeric ranks only for the top 10. Everyone else sees a band such as "top 20%", so weaker students see progress rather than a wall.

---

## 8. Mentor dashboard

Designed around "what do I need to do right now":

1. **Today** card: task assigned or not, submissions so far, verifications pending.
2. **Verification inbox** with keyboard shortcuts on desktop and swipe gestures on mobile.
3. **Batch heatmap**: 50 tiles, one per student, coloured by today's status (not started / submitted / verified / missed).
4. **At-risk list**: students who missed two or more of the last five days, or whose scores are falling.
5. **Planner**: assign tasks for the week, duplicate last week, or pull from the owner's master plan.
6. **Question bank and material library**: upload once, reuse everywhere.
7. **Add students and roster**: Excel template download, drag-and-drop upload, validation preview, seats remaining, activation status and resend invite.

---

## 9. Owner dashboard

1. **Overview**: total students, active today, average batch completion, average verification turnaround per mentor.
2. **Mentor scorecard**: assignment consistency, verification speed, batch completion rate, batch average score. This is how the owner spots mentors who need support.
3. **Capacity and waiting list**: seats left per mentor, students waiting for a seat, one-tap placement of a waiting student with a mentor who has room, and the projected date a new mentor is needed.
4. **Master plan**: publish a task to every batch at once; mentors can accept it or replace it for their batch.
5. **Content library**: shared question banks and materials for all mentors.
6. **Announcements**: broadcast to everyone, one batch, or all mentors.
7. **Settings**: point values, streak rules, deadline and rest days, branding (logo, colours), email and WhatsApp templates.
8. **Exports**: CSV of students, attendance, scores and points for any date range.
9. **Enrolment log**: every sheet a mentor uploaded, who uploaded it, when, and the result per row, kept for audit.

---

## 10. Ideas to customise the flow and make it friendlier

### For students

- **One-screen home.** Today's task, streak flame, points, and nothing else above the fold.
- **Reminders that adapt.** A nudge at the student's chosen time, and a second one two hours before the deadline only if they have not submitted. Email and WhatsApp options.
- **Install as an app** (PWA) so camera upload feels native.
- **Doubt thread per task.** Students ask, the mentor answers once, the whole batch benefits.
- **Re-check request.** One tap to ask the mentor to look again at a manual test mark.
- **Weekly report card** every Sunday: streak, points, weakest topics, one suggested revision.
- **Hindi / English toggle** for the interface.

### For mentors

- **Frictionless enrolment.** Downloadable Excel template, drag-and-drop upload, duplicate and typo detection (for example `gmial.com`), and a preview before a single email is sent.
- **Task templates and recurring tasks** ("Daily current affairs quiz, Mon to Sat").
- **AI-assisted verification.** The model reads the uploaded sheet, suggests a mark and flags anomalies; the mentor only confirms.
- **Bulk actions.** Tick all clean uploads at once; remind all non-submitters at once.
- **Voice feedback.** A 10-second audio note on a verification instead of typing.
- **Mentor streak.** Mentors also earn a streak for assigning daily and verifying within 24 hours. The owner sees it.

### For the owner

- **Batch personality.** Mentors name their batch and pick a colour; the owner sees friendly rivalry between batches on an owner-only view.
- **Cohorts and intakes.** Tag students by joining month or exam year for reporting.
- **Parent or guardian digest** (optional, off by default). A weekly summary by email.
- **Referral leads.** Students share a link; a referred friend lands in their mentor's **Add students** screen as a pre-filled row, and the referrer earns points once the friend is enrolled.
- **Rest-day calendar.** Mark holidays once and streaks respect them across all batches.
- **Mentor hand-over.** When a mentor leaves, reassign the whole batch to another mentor in one action, preserving history.

---

## 11. Suggested technical approach (builds on the current repo)

The existing app already has Next.js, Supabase, AI quiz generation, results with weak-topic analysis, flashcards and a leaderboard. The plan is to extend it rather than start over.

- **Auth.** Replace the hard-coded teacher password and name-only student entry with Supabase Auth. Students use email OTP; mentors and the owner use email + password. A `profiles` table holds role, Student ID, phone and batch. Enrolment creates the student's auth user server-side from the mentor's sheet, so students never register themselves.
- **Data model additions.** `batches`, `profiles`, `enrolment_imports`, `waiting_list`, `tasks`, `task_submissions`, `uploads`, `streaks`, `points_ledger`, `badges`, `announcements`.
- **Excel import.** Parse `.xlsx` and `.csv` on the server with SheetJS, validate every row, then enrol in a single transaction so a half-imported sheet can never happen. The original file and per-row result are stored on `enrolment_imports`. The existing `quizzes`, `questions` and `attempts` tables become the in-app test engine behind a task.
- **Isolation.** Row-level security policies keyed on `batch_id`. API routes stop using the service-role key for reads.
- **Uploads.** A private Supabase Storage bucket with signed URLs, and client-side image compression before upload.
- **Scheduling.** A nightly job (Supabase pg_cron or a Netlify scheduled function) at 00:05 IST closes the day, computes streaks and awards points. A second job sends reminders.
- **Email.** Supabase Auth handles OTP. A transactional provider (for example Resend) sends welcome, reminder and report emails from owner-editable templates.
- **AI.** The existing Anthropic integration generates tests, writes the one-line analysis summary and, later, pre-checks uploads.
- **Mobile.** Responsive web app with PWA install. No native app in phase 1.

---

## 12. Phased delivery

| Phase | Scope | Outcome |
|---|---|---|
| **1. Foundation** (2 to 3 weeks) | Auth for all three roles, mentor Excel upload with validation preview, Student ID by email, 50-seat limit with waiting list, batch isolation, daily task (in-app + manual), proof upload, mentor tick, streak, basic points, batch leaderboard | A batch can run its daily loop end to end |
| **2. Insight** (2 weeks) | Full analysis views, reminders, task templates and weekly planner, mentor heatmap, owner overview and mentor scorecard, exports | Mentors get faster; the owner gets visibility |
| **3. Delight** (ongoing) | Badges, levels, rewards catalogue, AI verification assist, doubt threads, weekly report cards, Hindi UI, parent digest | Retention and word of mouth |

---

## 13. Decisions needed from the owner

1. Deadline: a fixed 11:59 PM IST for everyone, or per mentor?
2. Rest days: is Sunday task-free by default?
3. Should the streak depend on submission (recommended) or on mentor verification?
4. When a mentor leaves, does the batch go to one replacement mentor or get redistributed?
5. Can a student ask to change mentor, and who approves?
6. Which reward types should exist in the catalogue at launch?
7. Over-capacity: when a mentor's sheet has more students than seats left, should the extras wait for the owner to place them (recommended) or be rejected outright?
8. Welcome message: email only, or email plus WhatsApp to the phone number from the sheet?

---

## 14. Design system and admin customisation (v0.3)

### Brand and colour

The theme is taken directly from the BNM logo: a teal gradient for the wordmark and a gold caduceus.

| Token | Value | Used for |
|---|---|---|
| Primary | `#2a8d78` | Buttons, links, progress, submitted tiles |
| Deep | `#0f3d34` | Headers, hero backgrounds, dark cards |
| Accent | `#f5d020` | Streak flame, highlights, points, today's task |
| Page | derived tint of primary | App background |
| Status | good `#0ca30c`, warning `#fab219`, critical `#d03b3b` | Heatmap and health pills, always paired with an icon and a label |

The logo sits on a white chip so it reads on both the deep-teal header and light cards. Every other colour in the interface is derived from the three brand colours at runtime, so the owner changes three values and the whole product follows.

Typography: Outfit for display text (headings, big numbers), Manrope for body text. Data charts use the validated single-hue teal ramp and never encode meaning by colour alone.

### Creative direction

- **The flame is the hero.** An animated streak flame anchors the student home, the login page and the landing hero. It dims to grey when the streak is zero.
- **One-screen home.** Today's task, streak, points and rank are the only things above the fold on a phone.
- **Deep-teal gradient headers** with a white nav pill for the active section, and an ECG pulse line on the landing hero as a nod to the caduceus.
- **Cards lift on hover, sections rise in on load**, and motion is disabled for users who prefer reduced motion.
- **Status is icon plus label**, never colour alone: heatmap tiles carry a glyph, health pills carry a dot and a word.

### What the owner can customise (admin console › Customise)

| Tab | Controls |
|---|---|
| **Branding** | App name, short name, tagline, logo (URL or upload), primary, deep and accent colours with presets, corner radius, live preview |
| **Labels** | Rename Owner, Mentor, Student, Batch, Daily Task, Points and Streak everywhere in the product |
| **Points** | Every value in the economy, plus level names and thresholds |
| **Streaks** | Whether a streak counts on submission or verification, freeze earn rate and cap, late window and late credit, comeback restore percentage, milestone days |
| **Schedule** | Daily deadline, mentor publish-by time, early-bird cut-off, timezone, rest days, seats per mentor |
| **Features** | Task types mentors may assign, WhatsApp, AI verification assist, doubt threads, teams, seasons, rewards, parent digest, Hindi UI |
| **Messages** | Welcome, reminder and verified templates with placeholders and a live preview |

Settings export and import as JSON, and reset to defaults in one click. In the prototype they persist in the browser; in phase 1 they move to a `settings` table read by every role.

### Prototype scope

The UI prototype on the `claude/brainy-media-webapp-blgn1o` branch covers the landing page, role login (Student ID + email code, mentor password, owner with second factor), the student home and full daily task flow (warm-up test, analysis, upload, waiting for tick), the mentor dashboard, verification inbox, assign task and Excel enrolment screens, and the owner overview and customisation console. All data is sample data; no backend calls are made yet.

---

## 15. Version 0.4 changes (approved 22 Sep 2026)

### Naming
- The product is **Brainy Medic**, monogram **BNM**, with the caduceus logo on a white chip everywhere.
- The owner role is called **Admin** in every screen and message. The first admin account carries a protected owner flag so a later admin cannot remove it.

### Parent Portal
- **Login.** The mentor's sheet carries Parent name and Parent phone. On enrolment the parent receives the Student ID and a link by WhatsApp or SMS. The parent logs in with the Student ID plus a 6-digit code sent only to the parent's phone, never to the student. A student can also invite a parent from their app if the sheet had no number. One parent phone can hold several children, with a switcher after login.
- **What a parent sees, read-only.** Child's name and Student ID, mentor's name and photo, Day N of 90 with the day grid, today's task status, streak, tasks completed, every test with its name, date, marks and percentage, and the running average. Every number shows when it was last updated. Rank is hidden by default and shows as "On track" or "Needs attention" instead. A "Request a call" button reaches the mentor. A Sunday WhatsApp summary is on by default.

### The 90-day challenge
- Every student runs **Day 1 to Day 90 from their own joining date**. Sundays count. Every 7th day is a lighter revision day.
- **Tasks are tied to Day N, not to a calendar date.** The admin fills the 90-day plan once and can edit any future day; the daily admin job is to check tomorrow's tasks, attach papers and adjust. Late joiners start from Day 1 automatically.
- Tasks show both the day number and the date, for example "Day 34 · Tue 22 Sep".
- Freezes: one earned per 15 days, at most three banked. Milestones at 7, 21, 45 and 90 days. A missed day breaks the streak, not the challenge; a "Perfect 90" badge rewards zero misses and Day 90 issues a certificate.

### Who does what
- **Admin** assigns every task through the plan, adds mentors manually or by CSV, reads every mentor's report for the last 7, 15, 30 or 90 days or any custom range, opens every mentor's profile and journey, and every student's profile through their mentor.
- **Mentor** verifies only. The inbox has two tabs, Daily tasks and Test analysis, in one place. A mentor sees today's tasks by day group, previews tomorrow, adds students by sheet or one at a time with parent contact, and uploads and changes their own photo.
- **Student** sees Day N of 90 on a grid, the day's task with date, the batch top 10, and the top 3 star performers across all batches with their mentors' names.

### Rankings
- **Mentors** rank by **average points per active student**, with the total shown beside it, so a mentor with 30 students is not penalised against one with 50. Top 3 appear as gold, silver and bronze cards; ranks 4 to 10 in a table. Shown to admin and to mentors, who see their own row highlighted.
- **Star performers.** The top 3 students across every batch, with mentor name and points, shown to admin, mentors and students.
- Ties break on points, then streak, then average test %. The rule is printed under every leaderboard.

### Enrolment and data
- Mentor sheet columns: Name, Phone, Email, Parent name, Parent phone. The single-student form uses the same checks.
- Admin add-mentor form: name, email, phone, subject, batch name. Invite goes by email and WhatsApp.
- Confirmed test marks, not self-marked ones, feed the parent portal and the average.

---

## Appendix A. 50 product inputs

Suggestions and considerations that go beyond the core spec, grouped by area. Each is small enough to accept or reject on its own.

### Onboarding and login

1. **Readable Student IDs.** Use a format like `BM-26-0143` and never show letters that look like digits, so the ID is easy to say aloud and type on a phone.
2. **Phone as a second login key.** Let students log in with Student ID or registered phone. OTP goes by email first; SMS is a paid fallback the owner can switch on.
3. **Trusted devices.** Remember a device for 30 days so students rarely need an OTP after the first login.
4. **Bounce tracking in the roster.** If a welcome email bounces, the mentor sees a red flag on that student and can fix the address and resend.
5. **Self-service profile edits.** Students can fix their own name spelling and photo. Only the mentor can change phone or email.
6. **Mentor introduction screen.** The first screen after login shows the mentor's photo, a 30-second intro video and the batch rules.
7. **Guarded Excel template.** Lock the header row, add phone and email validation inside the sheet, and include one example row so uploads fail less often.
8. **Roster export.** The mentor can download their batch with status, streak and points for offline use or a parent call.

### Daily task

9. **Publish-by time for mentors.** Tasks must be published by a set time, for example 9 AM. If not, the owner gets an alert and students see a friendly "today's task is on its way".
10. **Tomorrow's task preview.** At 9 PM the title and expected duration of tomorrow's task appear, so students can plan their time.
11. **Duration estimate on every task.** The mentor sets expected minutes; the student sees it before starting.
12. **Two-part tasks.** One task can have two parts, such as read then test. Both must be done for the day to count.
13. **Late window with reduced credit.** Accept submissions until 6 AM the next day for half points and no streak credit, so students still do the work.
14. **Autosave during tests.** A dropped connection should never lose answers. Resume exactly where the student left off.
15. **Offline paper.** Cache the manual test PDF on the device so it opens without network.

### Tests and analysis

16. **Per-question timing.** Record time spent on each question and show it in the review, for example "3 minutes on Q7, and wrong".
17. **Negative marking option.** Mirror real exam patterns such as minus one third per wrong answer, switchable per test.
18. **Weakness-weighted next test.** Give the AI generator each student's weak topics so tomorrow's in-app test leans toward them.
19. **"Explain in class" list.** After each test the mentor gets the three questions most students missed, ready for the next session.
20. **Personal trend, not just rank.** A 30-day line of the student's own scores, so improvement is visible even when rank is not.
21. **Answer key release timing.** For manual tests, release the key only after the deadline so early finishers cannot share it.
22. **Basic anti-cheating.** Shuffle question and option order per student, and show the mentor a tab-switch count for in-app tests.
23. **Explain it differently.** A per-question button that asks the AI for a second explanation, capped at a few uses per day.
24. **Mistake notebook.** Every wrong answer is collected into a personal revision list, and a weekly "re-attempt your mistakes" task is generated from it.

### Uploads and verification

25. **Capture guidance.** A frame guide, auto-crop, brightness check and a page-count reminder before the photo is submitted.
26. **Size and retention policy.** Compress each page to under 500 KB and archive uploads after 90 days to keep storage costs flat.
27. **Progressive multi-page upload.** Save page 1 of 3 as it goes, so a bad network never forces a full retry.
28. **Verification SLA.** The mentor sees a timer on pending uploads; the owner sees average turnaround and gets an alert past 24 hours.
29. **Feedback chips.** One-tap comments such as "Good work", "Show steps", "Redo Q3", with optional free text.
30. **Random quality audit.** The owner can sample five verified uploads per mentor per week to check marking quality.
31. **Student self-marking.** For manual tests the student enters their own marks from the key, and the mentor confirms or corrects. Verification becomes a check, not data entry.

### Streaks and points

32. **Streak heatmap for mentors.** A broken streak highlights the student and suggests a personal message.
33. **Comeback task.** After a break, completing a special task within 48 hours restores half the streak, so students return instead of giving up.
34. **Seasons.** Quarterly seasons with a hall of fame and a fresh leaderboard, so new students can still compete.
35. **Teams within a batch.** Five teams of ten with a weekly team completion rate. Peer support, not just individual pressure.
36. **Monthly certificate.** An auto-generated PDF with the owner's signature and logo for streak and rank achievements.
37. **Points ledger.** A screen listing every point earned and why. Transparency removes disputes.
38. **Anti-gaming rules.** Points only on the first attempt, practice retakes earn nothing, and upload points wait for the mentor's tick.

### Mentor experience

39. **8 AM digest.** Yesterday's completion rate, pending verifications and at-risk students, by email or WhatsApp.
40. **One-tap personal nudge.** A pre-written message to a student from the heatmap, opened as a WhatsApp deep link.
41. **Private notes per student.** Visible to the owner, invaluable during a mentor hand-over.
42. **Drag-and-drop task calendar.** Plan a month at a glance and let holidays from the owner's calendar block days automatically.
43. **Tagged question bank.** Every question carries topic, difficulty and source so it can be reused across days and shared into the owner's library.

### Owner and operations

44. **Mentor onboarding checklist.** Profile, first sheet upload, first task, first verification. The owner sees who is stuck at which step.
45. **View as.** The owner can open the app exactly as a chosen student or mentor sees it, read-only, for support calls.
46. **Alert rules.** Batch completion below 60 percent two days running, no task by 10 AM, or a verification backlog above 30, each notifies the owner.
47. **Data rights.** Consent captured at first login, full export anytime, and a delete-my-data request path.
48. **AI cost control.** Daily generation quotas per mentor, caching of generated tests, and an AI spend view for the owner.
49. **Teaching Assistant role.** Can verify uploads but not assign tasks. This is how one mentor scales beyond 50 later without breaking the model.
50. **Full branding.** Logo, colours, a custom domain such as app.brainymedia.in and a branded email sender, so the product feels like Brainy Medic and not a generic tool.
