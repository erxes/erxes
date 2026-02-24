# Client Portal Authentication Flows

This document describes how registration, login, forgot password, and reset password work in the client portal. It is the single reference for understanding the end-to-end process.

## Overview

- **Registration**: User registers (email/phone, optional password) → optionally verifies with OTP → can log in (cookie set on verify or after auto-verify).
- **Login**: Either **credentials** (email/phone + password) or **passwordless OTP** (request OTP → submit OTP).
- **Forgot password**: User submits identifier → backend sends either a reset **link** (token in URL) or a **code** (OTP) depending on portal config.
- **Reset password**: With **link**: call reset with `token` from URL. With **code**: call reset with `identifier` + `code` (the received OTP).
- **Change email / Change phone**: Authenticated user requests change with new email or phone → OTP is sent to the new value → user confirms with code → email/phone and verification flags are updated.

The CP user document has a single field **actionCode**: `{ code, expires, type }`. It is used for:

- Registration verification (types: `EMAIL_VERIFICATION`, `PHONE_VERIFICATION`)
- Passwordless login OTP (same types; code is validated then user is logged in)
- Password reset (type: `PASSWORD_RESET`; `code` holds either a link token or a numeric OTP depending on config)
- Change email (type: `EMAIL_CHANGE`) and change phone (type: `PHONE_CHANGE`): OTP sent to the new value; user document also has optional `pendingEmail` / `pendingPhone` until confirmation.

---

## Flow Diagrams

### Registration and Verify

```mermaid
sequenceDiagram
  participant Client
  participant Resolver
  participant CPUserService
  participant ContactService
  participant Verification
  participant Notification

  Client->>Resolver: clientPortalUserRegister(params)
  Resolver->>CPUserService: registerUser(...)
  CPUserService->>ContactService: handleCPContacts(...)
  ContactService-->>CPUserService: user

  alt Verification enabled for identifier
    CPUserService->>Verification: generateVerificationCode + setActionCode
    CPUserService->>Notification: sendOTP
    CPUserService-->>Resolver: user (unverified)
    Resolver-->>Client: user
    Note over Client: User receives OTP
    Client->>Resolver: clientPortalUserVerify(userId, email, phone, code)
    Resolver->>CPUserService: verifyUser(...)
    CPUserService->>CPUserService: validateActionCode, markUserAsVerified
    Resolver->>Resolver: setAuthCookie
    Resolver-->>Client: user + tokens
  else Auto-verify (verification disabled)
    CPUserService->>CPUserService: autoVerifyUser
    CPUserService-->>Resolver: user (verified)
    Resolver-->>Client: user
  end
```

### Login (Credentials vs OTP)

```mermaid
sequenceDiagram
  participant Client
  participant Resolver
  participant CPUserService
  participant VerificationService
  participant OTPService
  participant AuthService

  alt Login with credentials
    Client->>Resolver: clientPortalUserLoginWithCredentials(email, phone, password)
    Resolver->>CPUserService: login(...)
    CPUserService->>CPUserService: validateUserVerificationStatus, comparePassword
    CPUserService-->>Resolver: user
    Resolver->>AuthService: setAuthCookie
    Resolver-->>Client: success + tokens
  else Login with OTP (passwordless)
    Client->>Resolver: clientPortalUserRequestOTP(identifier)
    Resolver->>VerificationService: sendOTPForLogin(...)
    VerificationService-->>Client: OTP sent
    Client->>Resolver: clientPortalUserLoginWithOTP(identifier, otp)
    Resolver->>OTPService: loginWithOTP(...)
    OTPService->>OTPService: validateActionCode
    OTPService-->>Resolver: user
    Resolver->>AuthService: setAuthCookie
    Resolver-->>Client: success + tokens
  end
```

### Forgot Password and Reset

```mermaid
sequenceDiagram
  participant Client
  participant Resolver
  participant PasswordService
  participant Notification

  Client->>Resolver: clientPortalUserForgotPassword(identifier)
  Resolver->>PasswordService: forgotPassword(...)
  PasswordService->>PasswordService: find user by identifier

  alt Reset mode: link
    PasswordService->>PasswordService: generate token, setActionCode(PASSWORD_RESET)
    PasswordService->>Notification: sendPasswordResetLink (URL with token)
    Resolver-->>Client: instructions sent
    Note over Client: User opens link with ?token=...
    Client->>Resolver: clientPortalUserResetPassword(token, newPassword)
    Resolver->>PasswordService: resetPasswordWithToken(...)
    PasswordService->>PasswordService: find user by actionCode.code, validate, update password, clear actionCode
    Resolver->>Resolver: setAuthCookie
    Resolver-->>Client: success + tokens
  else Reset mode: code (OTP)
    PasswordService->>PasswordService: generate code, setActionCode(PASSWORD_RESET)
    PasswordService->>Notification: sendOTP
    Resolver-->>Client: instructions sent
    Note over Client: User receives OTP
    Client->>Resolver: clientPortalUserResetPassword(identifier, code, newPassword)
    Resolver->>PasswordService: resetPasswordWithCode(...)
    PasswordService->>PasswordService: find user by identifier, validate actionCode, update password, clear actionCode
    Resolver->>Resolver: setAuthCookie
    Resolver-->>Client: success + tokens
  end
```

### Change email / Change phone

Requires an authenticated client portal user (cookie). OTP is sent to the **new** email or phone; the same rate limits as login OTP apply.

```mermaid
sequenceDiagram
  participant Client
  participant Resolver
  participant ChangeContactService
  participant Notification

  Client->>Resolver: clientPortalUserRequestChangeEmail(newEmail)
  Resolver->>ChangeContactService: requestChangeEmail(cpUser, newEmail, ...)
  ChangeContactService->>ChangeContactService: validate, uniqueness, set pendingEmail + actionCode(EMAIL_CHANGE)
  ChangeContactService->>Notification: sendOTP to newEmail (recipientOverride)
  Resolver-->>Client: OTP sent

  Client->>Resolver: clientPortalUserConfirmChangeEmail(code)
  Resolver->>ChangeContactService: confirmChangeEmail(cpUser, code, ...)
  ChangeContactService->>ChangeContactService: validateActionCode, email = pendingEmail, clear pending + actionCode
  Resolver-->>Client: CPUser
```

Same pattern for phone: `clientPortalUserRequestChangePhone(newPhone)` then `clientPortalUserConfirmChangePhone(code)`.

---

## API Summary

| Flow | Mutation / usage |
|------|-------------------|
| Register | `clientPortalUserRegister({ email?, phone?, password?, ... })` |
| Verify | `clientPortalUserVerify({ userId, email, phone, code })` — sets cookie on success |
| Login (credentials) | `clientPortalUserLoginWithCredentials({ email, phone, password })` |
| Request OTP for login | `clientPortalUserRequestOTP({ identifier })` |
| Login with OTP | `clientPortalUserLoginWithOTP({ identifier, otp })` |
| Forgot password | `clientPortalUserForgotPassword({ identifier })` — backend chooses link or code from portal config |
| Reset (link) | `clientPortalUserResetPassword({ token, newPassword })` — token from reset URL |
| Reset (code) | `clientPortalUserResetPassword({ identifier, code, newPassword })` — code is the OTP received |
| Request change email | `clientPortalUserRequestChangeEmail({ newEmail })` — requires auth; OTP sent to new email |
| Confirm change email | `clientPortalUserConfirmChangeEmail({ code })` — requires auth |
| Request change phone | `clientPortalUserRequestChangePhone({ newPhone })` — requires auth; OTP sent to new phone |
| Confirm change phone | `clientPortalUserConfirmChangePhone({ code })` — requires auth |

---

## actionCode Types

| type | Used in | Meaning |
|------|--------|--------|
| `EMAIL_VERIFICATION` | Registration, passwordless login (email) | OTP sent to email |
| `PHONE_VERIFICATION` | Registration, passwordless login (phone) | OTP sent to phone |
| `PASSWORD_RESET` | Forgot password (link or code) | Reset link token or OTP code stored in `actionCode.code` |
| `EMAIL_CHANGE` | Change email (authenticated) | OTP sent to new email; `pendingEmail` set until confirm |
| `PHONE_CHANGE` | Change phone (authenticated) | OTP sent to new phone; `pendingPhone` set until confirm |

Validation always checks: presence of actionCode, correct type, not expired, and code/token match.
