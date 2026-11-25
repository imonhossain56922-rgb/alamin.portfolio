# Firestore Security Specification (Phase 0)

## 1. Data Invariants
1. Public visitors may only read published portfolio content (`projects` where `published == true`, visible `experiences`, `skills`, `software`, `categories`, `profile/main`, and `settings/site`).
2. Unpublished draft projects (`published == false`) are strictly invisible to public and non-admin users.
3. Private user accounts (`/users/{userId}`) and admin registry (`/admins/{userId}`) are isolated from public reads and cross-user access.
4. Only verified administrators (`isAdmin()`) may create, update, or delete portfolio entities, settings, experiences, skills, software, categories, or profile records.
5. No user may self-assign `role: "admin"` or escalate privileges by writing to `/admins/{userId}` or injecting shadow fields.
6. All string fields enforce explicit `size()` limits; all arrays are strictly bounded (`<= 20` or `<= 12`); all document IDs match `^[a-zA-Z0-9_\-]+$`.
7. `createdAt` is immutable on updates and must equal `request.time` on creation; `updatedAt` must equal `request.time` on writes.

## 2. The "Dirty Dozen" Attack Payloads
1. **Unauthenticated Project Create**: Anonymous user attempts `create` on `/projects/p1` -> `PERMISSION_DENIED`.
2. **Non-Admin Profile Overwrite**: Signed-in non-admin user attempts `update` on `/profile/main` -> `PERMISSION_DENIED`.
3. **Self-Admin Privilege Escalation**: Signed-in non-admin user attempts `create` on `/admins/{theirUid}` with `{ role: "admin" }` -> `PERMISSION_DENIED`.
4. **Shadow Field Injection**: Admin or attacker attempts `create` on `/projects/p1` with extra ghost field `{ isFeaturedHack: true }` -> `PERMISSION_DENIED`.
5. **Draft Project Leak (Get)**: Public visitor attempts `get` on `/projects/draft-1` where `published == false` -> `PERMISSION_DENIED`.
6. **Draft Project Scraping (List)**: Public visitor runs unfiltered `list` on `/projects` without `where('published', '==', true)` -> `PERMISSION_DENIED`.
7. **PII Cross-User Read**: Signed-in non-admin user attempts `get` on `/users/other-uid` -> `PERMISSION_DENIED`.
8. **Email Spoofing Attack**: Attacker with `email: "imonhossain56922@gmail.com"` and `email_verified: false` attempts write on `/profile/main` -> `PERMISSION_DENIED`.
9. **ID Poisoning Attack**: Attacker targets `/projects/${'a'.repeat(300)}` -> `PERMISSION_DENIED`.
10. **Denial-of-Wallet Oversized Description**: Admin or attacker submits `description` with 10,000 characters (`> 4000`) -> `PERMISSION_DENIED`.
11. **Unbounded Array Injection**: Payload includes `galleryImages` with 25 elements (`> 12`) -> `PERMISSION_DENIED`.
12. **Immortal `createdAt` Tampering**: Update payload attempts to alter `createdAt` or spoof `updatedAt` to a past timestamp -> `PERMISSION_DENIED`.
