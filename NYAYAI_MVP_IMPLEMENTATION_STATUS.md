# NYAYAI MVP Implementation Status

## 1. What This MVP Is

NYAYAI is being built as an **Undertrial Case Review and Legal-Aid Action Platform**.

The main question on the first screen is:

> **Which undertrial needs attention today, and why?**

The system is designed to help prison teams, DLSA lawyers, legal-aid teams, and UTRC stakeholders review cases faster.

It does **not** make the final bail or release decision. It gives authorised people information and action signals for human review.

---

## 2. What We Have Implemented

### A. Dashboard Action Centre

The dashboard now shows cases by urgency:

- **Urgent**: immediate review is needed.
- **Attention required**: the case needs follow-up soon.
- **No immediate action**: continue monitoring the case.

The dashboard can show why a case was prioritised, such as:

- Long custody period
- Section 479 review signal
- Repeated adjournments
- Missing documents or information
- Legal-aid lawyer not assigned
- UTRC review due
- Open action deadline

Cases are ranked using transparent rules. The system does not hide the reason behind a priority.

### B. Undertrial Case Profile

Each undertrial has a profile containing:

- Prisoner ID
- Name and basic details
- Prison and district
- Arrest date
- Custody duration
- Linked court cases
- CNR number
- Offence sections
- Maximum sentence information
- Court and case stage
- Assigned lawyer
- Workflow stage
- Hearing history
- Adjournment history
- Existing action items

### C. Unified Case Timeline

The profile brings important events into one timeline, including:

- Arrest and start of custody
- Case filing
- Charge framing
- Hearings
- Adjournments
- Orders and hearing references

This gives a lawyer or officer a quick view instead of requiring them to search through many separate records.

### D. Review Signal Engine

The system generates administrative review signals for human verification.

Examples:

- Prolonged custody
- Possible Section 479 review
- Repeated adjournments
- Pending workflow action
- No legal-aid lawyer assigned
- UTRC review due
- Open deadline

The interface clearly states that these are review signals, not automatic bail or release decisions.

### E. Missing Information Engine

The system identifies missing or incomplete information, including:

- Legal-aid lawyer assignment
- Court case record
- CNR or case identifier
- Case filing date
- Latest hearing order
- Social or financial status report
- Linked case verification

Each missing item can show an expected owner, such as:

- Superintendent
- DLSA
- Court data team
- Prison or court records team

### F. Document Register

The MVP now supports demo records for documents such as:

- FIR
- Chargesheet
- Financial and social status report
- Latest hearing order

Each document can show:

- Document type
- Document title
- Status
- Source
- Document date
- Responsible owner
- Verification note

The current records are dummy data. Real file upload and document processing are not implemented yet.

### G. Bail Application History

The MVP now includes demo bail application records with:

- Application type
- Filing date
- Status
- Outcome date
- Court
- Counsel
- Order reference
- Notes

Example statuses include:

- Under review
- Rejected
- Approved
- Filed

These are structured database records, but they are currently seeded demo records.

### H. UTRC Review Records

The MVP includes demo UTRC records containing:

- Review date
- Review status
- Priority
- Recommendation
- Missing item
- Reviewer
- Decision date
- Notes

The dashboard also shows how many cases require UTRC-related review.

### I. Deadline and Action Tracking

The MVP includes deadline records containing:

- Deadline type
- Due date
- Status
- Priority
- Responsible role
- Required action
- Notes

This supports future reminders and escalation workflows.

### J. Existing Legal and Workflow Engines

The existing platform already includes:

- BNSS Section 479 deterministic assessment
- Custody-day calculation
- Defence-delay exclusion calculation
- Adjournment and delay intelligence
- Role-based action workflow
- Workflow stages from identification to outcome
- Audit logging for important profile activity
- Dashboard analytics

### K. Correct Workflow Stages and Responsibilities

The workflow stages are aligned in this exact order:

```text
IDENTIFIED
  -> VERIFIED
  -> ASSIGNED
  -> DRAFTED
  -> REVIEWED
  -> FILED
  -> OUTCOME
```

| Stage | Simple meaning | Main responsible role | What happens next |
|---|---|---|---|
| **IDENTIFIED** | The system has found a case that may need review. | System / Superintendent | Verify the case information and eligibility signals. |
| **VERIFIED** | The prison or authorised team has checked the basic facts. | Superintendent / Prison team | Assign the case to a DLSA or legal-aid lawyer. |
| **ASSIGNED** | A legal-aid lawyer or responsible officer is assigned. | DLSA / Legal-aid team | Prepare the case materials and draft the required application. |
| **DRAFTED** | The draft petition, application, or action document is prepared. | DLSA lawyer | Review the draft for legal and factual accuracy. |
| **REVIEWED** | The draft has passed internal legal review. | Senior lawyer / authorised reviewer | Submit the approved application to the court. |
| **FILED** | The application or petition has been filed in court. | DLSA / Court filing team | Track the court order or final case outcome. |
| **OUTCOME** | The court or authorised body has recorded the result. | Court / authorised administrator | Close the action or create a follow-up task. |

#### Stage Rules

- A case should move forward only after the current stage is completed.
- **IDENTIFIED** does not mean the person should be released; it means human verification is required.
- **VERIFIED** confirms that the available case information has been checked, not that bail has been granted.
- **ASSIGNED** confirms ownership of the next legal action.
- **DRAFTED** and **REVIEWED** refer to internal preparation and approval, not a court decision.
- **FILED** means the application was submitted; it does not mean the application was approved.
- **OUTCOME** records the result and any required follow-up.
- The Section 479 rules engine, delay intelligence, missing-information signals, and UTRC deadlines support the workflow but do not replace authorised legal decisions.

### L. Light and Dark Mode

The case profile and dashboard support both light mode and dark mode. The previous dark-background problem in light mode was corrected, and the main case content now follows the selected theme.

---

## 3. What Is Partially Implemented

These features exist as a working MVP demonstration, but they are not connected to real government systems yet.

### A. UTRC Meeting Assistant

Implemented now:

- UTRC review counts
- UTRC due dates
- Priority levels
- Missing information for review
- Case-level UTRC recommendations

Still needed:

- Create a UTRC meeting
- Add meeting attendees
- Create a formal agenda
- Add cases to a meeting
- Record committee decisions
- Record minutes
- Export an official meeting report
- Track follow-up actions after the meeting

### B. Bail Workflow

Implemented now:

- Bail application records
- Filing and outcome details
- Bail status display
- Bail history on the case profile

Still needed:

- Add and edit applications from the UI
- Upload bail orders
- Link applications to court documents
- Track filing, hearing, order, and compliance steps
- Notify the assigned lawyer about changes

### C. Document Management

Implemented now:

- Document register
- Document status
- Missing-document signals
- Document owner and source fields

Still needed:

- Upload files
- PDF and image storage
- OCR
- Automatic document classification
- Extract dates, sections, names, and case numbers
- Document version history
- Digital verification and approval
- Secure document access controls

### D. Integrations

Implemented now:

- Profile section showing connected record categories:
  - Prison custody records
  - Court/CNR records
  - DLSA legal-aid records
  - Documents
  - Bail source mapping
  - UTRC register

Still needed:

- Real e-Prisons connector
- Real eCourts or CNR connector
- Real DLSA records connector
- Secure data exchange process
- Data synchronisation schedule
- Integration error handling
- Source-system audit records

### E. Alerts and Notifications

Implemented now:

- Priority and deadline information on the dashboard
- Open action indicators

Still needed:

- In-app notifications
- Email alerts
- SMS alerts
- Escalation when a deadline is missed
- Reminder schedules
- Notification preferences by role

### F. AI Case Understanding

Implemented now:

- Deterministic rules
- Structured timeline generation from stored case records
- Explainable review signals
- Delay pattern analysis

Still needed:

- FIR document understanding
- Chargesheet summarisation
- Bail-order summarisation
- Automatic extraction from uploaded documents
- Source citations for every extracted fact
- Human approval of AI-extracted information

---

## 4. What Is Not Implemented Yet

The following areas are planned but are not part of the current working MVP:

- Real document upload and storage
- OCR and document extraction
- Production AI document analysis
- Real court, prison, or DLSA integrations
- Formal UTRC meeting management
- Calendar and deadline synchronisation
- Email, SMS, and push notifications
- Financial/social report upload workflow
- Multi-level approval workflow
- Full role-based permissions for every record type
- Data import from CSV or government systems
- Production deployment configuration
- Production-grade secrets management
- Encryption and key management for sensitive files
- Backup and disaster recovery process
- Security testing and penetration testing
- Formal DPDP compliance assessment
- Complete database migration system
- Official government reporting and export formats

---

## 5. Current MVP Architecture

```text
Dummy / existing case data
          |
          v
Backend API and database
          |
          +--> Custody and Section 479 rules
          +--> Delay intelligence
          +--> Missing information engine
          +--> Review priority engine
          +--> Bail records
          +--> Document records
          +--> UTRC records
          +--> Deadline records
          |
          v
Frontend dashboard and case profile
          |
          +--> Who needs attention today?
          +--> Case health and next action
          +--> Unified timeline
          +--> Document register
          +--> Bail history
          +--> UTRC review
          +--> Connected records
          +--> Action workflow
```

### Main technology areas

- **Frontend:** Next.js, React, TypeScript, Tailwind CSS
- **Backend:** FastAPI, Python
- **Database:** SQLite for the MVP
- **Authentication:** JWT-based login
- **Current data:** Synthetic demo records
- **API documentation:** FastAPI Swagger at `/docs`

---

## 6. Demo Data Status

The project includes synthetic records for multiple scenarios:

- Long custody
- Eligible and borderline cases
- Multiple cases for one prisoner
- Repeated adjournments
- Missing reports
- Previous bail applications
- UTRC review due
- Open deadlines
- Assigned and unassigned legal-aid counsel

The data is for product demonstration only. It must not be treated as real legal, prison, court, or prisoner data.

To refresh the demo database:

```powershell
cd C:\Users\rajes\Desktop\NYAYAI\backend
python seed.py
```

The seed script clears and recreates the synthetic database.

---

## 7. Recommended Next Implementation Order

### Phase 1: Make the MVP operational

1. Add document upload for PDF and images.
2. Add create and edit forms for bail applications.
3. Add UTRC meeting creation and agenda management.
4. Add deadline completion and reassignment actions.
5. Add in-app notifications.
6. Add CSV import for external case records.

### Phase 2: Add controlled intelligence

1. Add OCR.
2. Extract structured facts from documents.
3. Show the source document beside every extracted fact.
4. Require human verification before extracted data affects prioritisation.
5. Add case-summary generation.
6. Add document and timeline confidence indicators.

### Phase 3: Prepare for pilot use

1. Replace SQLite with PostgreSQL.
2. Add database migrations.
3. Add stronger role and permission controls.
4. Add encrypted document storage.
5. Add complete audit trails.
6. Add backup and recovery procedures.
7. Complete security and privacy review.
8. Pilot with a DLSA or legal-aid team using approved data.

### Phase 4: Add real integrations

1. Confirm what e-Prisons already provides.
2. Confirm what eCourts/CNR data can legally be accessed.
3. Define DLSA data-sharing agreements.
4. Build read-only connectors first.
5. Add synchronisation monitoring.
6. Add controlled write-back only after approval.

---

## 8. Important Product Boundaries

NYAYAI should be presented as:

> **An AI-assisted undertrial case review and legal-aid action platform.**

It should not be presented as:

- An automatic bail decision system
- A release approval system
- A replacement for judges or lawyers
- A replacement for e-Prisons
- A replacement for eCourts
- A system that guarantees release

Every review signal must remain subject to authorised human and legal verification.

---

## 9. Current Status in One Sentence

The project now has a strong synthetic-data MVP for identifying undertrials who need attention, explaining why they need attention, showing their case timeline, tracking missing information, and preparing UTRC/legal-aid actions; real documents, AI extraction, notifications, and government integrations are the next major steps.


