# Client Portal Authentication Flows

This document describes how registration, login, forgot password, and reset password work in the client portal. It is the single reference for understanding the end-to-end process.

## Overview

- **Registration**: User registers (email/phone, optional password) → optionally verifies with OTP → can log in (cookie set on verify or after auto-verify).
- **Login**: Either **credentials** (email/phone + password) or **passwordless OTP** (request OTP → submit OTP).
- **Forgot password**: User submits identifier → backend sends either a reset **link** (token in URL) or a **code** (OTP) depending on portal config.
- **Reset password**: With **link**: call reset with `token` from URL. With **code**: call reset with `identifier` + `code` (the received OTP).

The CP user document has a single field **actionCode**: `{ code, expires, type }`. It is used for:

- Registration verification (types: `EMAIL_VERIFICATION`, `PHONE_VERIFICATION`)
- Passwordless login OTP (same types; code is validated then user is logged in)
- Password reset (type: `PASSWORD_RESET`; `code` holds either a link token or a numeric OTP depending on config)

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

---

## actionCode Types

| type | Used in | Meaning |
|------|--------|--------|
| `EMAIL_VERIFICATION` | Registration, passwordless login (email) | OTP sent to email |
| `PHONE_VERIFICATION` | Registration, passwordless login (phone) | OTP sent to phone |
| `PASSWORD_RESET` | Forgot password (link or code) | Reset link token or OTP code stored in `actionCode.code` |

Validation always checks: presence of actionCode, correct type, not expired, and code/token match.
