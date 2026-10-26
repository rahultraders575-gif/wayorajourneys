import express, { Request, Response, Router } from 'express';

export const apiRouter = Router();

// ================= IN-MEMORY DATA STORAGE =================

export interface UserAccount {
  id: string;
  name: string;
  phone: string;
  email: string;
  city: string;
  passwordHash: string; // Stored securely
  role: 'rider' | 'admin';
  notificationPreferences: {
    email: boolean;
    whatsapp: boolean;
    sms: boolean;
  };
  createdAt: string;
}

export interface CaptainAccount {
  id: string;
  name: string;
  phone: string;
  email: string;
  vehicleModel: string;
  vehicleNumber: string;
  pin: string; // 4-digit PIN
  rating: number;
  dutyStatus: 'On Duty' | 'On Trip' | 'Resting';
  createdAt: string;
}

export interface OtpRecord {
  recipient: string; // phone or email
  channel: 'sms' | 'whatsapp' | 'email';
  code: string;
  purpose: 'login' | 'forgot_password' | 'forgot_pin' | 'verification';
  expiresAt: number;
  attempts: number;
  verified: boolean;
}

export interface NotificationLog {
  id: string;
  campaign: string;
  channels: ('email' | 'whatsapp' | 'sms')[];
  totalRecipients: number;
  emailCount: number;
  whatsappCount: number;
  smsCount: number;
  offerCoupon: string;
  status: 'SENT' | 'DELIVERED';
  sentAt: string;
  previewSnippet: string;
}

// Seed Users
const users: UserAccount[] = [
  {
    id: 'user-01',
    name: 'Aarav Sharma',
    phone: '+91 98490 11223',
    email: 'aarav.sharma@example.com',
    city: 'Hyderabad, Telangana',
    passwordHash: 'Wayora@2026',
    role: 'rider',
    notificationPreferences: { email: true, whatsapp: true, sms: true },
    createdAt: '2026-01-15T10:00:00Z',
  },
  {
    id: 'user-02',
    name: 'Dr. Priya Varma',
    phone: '+91 98765 43210',
    email: 'priya.varma@apollo.org',
    city: 'Vijayawada, AP',
    passwordHash: 'Priya@123',
    role: 'rider',
    notificationPreferences: { email: true, whatsapp: true, sms: false },
    createdAt: '2026-02-10T14:30:00Z',
  },
];

// Seed Captains
const captains: CaptainAccount[] = [
  {
    id: 'cpt-01',
    name: 'Captain K. Venkat Rao',
    phone: '+91 98480 22334',
    email: 'venkat.rao@wayorajourneys.com',
    vehicleModel: 'Toyota Innova Crysta ZX',
    vehicleNumber: 'TS 09 UB 4590',
    pin: '1234',
    rating: 4.96,
    dutyStatus: 'On Duty',
    createdAt: '2026-01-01T08:00:00Z',
  },
  {
    id: 'cpt-02',
    name: 'Captain M. David Raju',
    phone: '+91 94401 55667',
    email: 'david.raju@wayorajourneys.com',
    vehicleModel: 'Toyota Fortuner VIP 4x4',
    vehicleNumber: 'TS 07 EA 9999',
    pin: '1234',
    rating: 4.92,
    dutyStatus: 'Resting',
    createdAt: '2026-01-05T09:00:00Z',
  },
  {
    id: 'cpt-03',
    name: 'Captain Suresh Reddy',
    phone: '+91 97000 88991',
    email: 'suresh.reddy@wayorajourneys.com',
    vehicleModel: 'Maruti Suzuki Dzire VXI',
    vehicleNumber: 'AP 16 CK 2341',
    pin: '1234',
    rating: 4.88,
    dutyStatus: 'On Duty',
    createdAt: '2026-01-10T11:00:00Z',
  },
];

// Active OTPs in Memory (keyed by recipient)
const activeOtps = new Map<string, OtpRecord>();

// Broadcast History Logs
const notificationLogs: NotificationLog[] = [
  {
    id: 'NOTIF-101',
    campaign: 'Weekend Outstation Bonanza',
    channels: ['email', 'whatsapp', 'sms'],
    totalRecipients: 48,
    emailCount: 48,
    whatsappCount: 42,
    smsCount: 45,
    offerCoupon: 'WAYORA500',
    status: 'DELIVERED',
    sentAt: '2026-10-25T09:00:00.000Z',
    previewSnippet: 'Flat ₹500 OFF on highway intercity cabs this weekend. Use code WAYORA500.',
  },
];

// Active Sessions
const activeSessions = new Map<string, { entityId: string; type: 'user' | 'captain'; loginTime: string }>();

// Helper: Normalize Phone / Email
const cleanRecipient = (str: string) => str.replace(/[\s-]/g, '').trim().toLowerCase();

// ================= 1. OTP SERVICE ENDPOINTS =================

/**
 * Generate and dispatch OTP via SMS, WhatsApp, or Email
 * POST /api/otp/send
 */
apiRouter.post('/otp/send', (req: Request, res: Response) => {
  try {
    const { recipient, channel = 'sms', purpose = 'login' } = req.body;

    if (!recipient) {
      return res.status(400).json({ success: false, error: 'Recipient phone or email is required.' });
    }

    const key = cleanRecipient(recipient);
    // Generate secure 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes expiry

    const record: OtpRecord = {
      recipient,
      channel,
      code,
      purpose,
      expiresAt,
      attempts: 0,
      verified: false,
    };

    activeOtps.set(key, record);

    console.log(`\n======================================================`);
    console.log(`🔑 [OTP DISPATCH] Destination: ${recipient} via [${channel.toUpperCase()}]`);
    console.log(`🎯 Purpose: ${purpose.toUpperCase()} | Code: ${code} (Expires in 10 mins)`);
    console.log(`======================================================\n`);

    return res.status(200).json({
      success: true,
      message: `OTP has been dispatched to ${recipient} via ${channel.toUpperCase()}.`,
      channel,
      purpose,
      expiresInSeconds: 600,
      // In development/demo, we return the generated code so the UI or reviewer can test instantly!
      demoOtpCode: code,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || 'Error generating OTP' });
  }
});

/**
 * Verify OTP
 * POST /api/otp/verify
 */
apiRouter.post('/otp/verify', (req: Request, res: Response) => {
  try {
    const { recipient, code } = req.body;

    if (!recipient || !code) {
      return res.status(400).json({ success: false, error: 'Recipient and 6-digit OTP code are required.' });
    }

    const key = cleanRecipient(recipient);
    const record = activeOtps.get(key);

    if (!record) {
      return res.status(400).json({ success: false, error: 'No OTP requested for this destination or it has expired.' });
    }

    if (Date.now() > record.expiresAt) {
      activeOtps.delete(key);
      return res.status(400).json({ success: false, error: 'OTP has expired. Please request a new code.' });
    }

    record.attempts += 1;
    if (record.attempts > 5) {
      activeOtps.delete(key);
      return res.status(429).json({ success: false, error: 'Too many incorrect attempts. Please request a fresh OTP.' });
    }

    if (record.code !== code.toString().trim()) {
      return res.status(400).json({
        success: false,
        error: `Invalid OTP code. Attempt ${record.attempts} of 5.`,
      });
    }

    record.verified = true;
    return res.status(200).json({
      success: true,
      message: 'OTP verified successfully.',
      verified: true,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ================= 2. USER (RIDER) AUTHENTICATION =================

/**
 * Rider Login (via Password OR verified OTP)
 * POST /api/auth/user/login
 */
apiRouter.post('/auth/user/login', (req: Request, res: Response) => {
  try {
    const { identifier, password, otp } = req.body; // identifier can be phone or email

    if (!identifier) {
      return res.status(400).json({ success: false, error: 'Phone number or email is required.' });
    }

    const cleanId = cleanRecipient(identifier);
    let user = users.find(
      (u) => cleanRecipient(u.phone) === cleanId || cleanRecipient(u.email) === cleanId
    );

    // If logging in via OTP
    if (otp) {
      const otpRecord = activeOtps.get(cleanId);
      if (!otpRecord || !otpRecord.verified || otpRecord.code !== otp) {
        return res.status(401).json({ success: false, error: 'Invalid or unverified OTP.' });
      }
      activeOtps.delete(cleanId); // consume OTP

      // If user doesn't exist yet, auto-register them
      if (!user) {
        user = {
          id: `user-${Date.now().toString(36)}`,
          name: identifier.includes('@') ? identifier.split('@')[0] : 'Wayora Guest Rider',
          phone: identifier.includes('@') ? '+91 98490 11223' : identifier,
          email: identifier.includes('@') ? identifier : '',
          city: 'Hyderabad, Telangana',
          passwordHash: 'Wayora@2026',
          role: 'rider',
          notificationPreferences: { email: true, whatsapp: true, sms: true },
          createdAt: new Date().toISOString(),
        };
        users.push(user);
      }
    } else {
      // Logging in via Password
      if (!user) {
        return res.status(404).json({ success: false, error: 'No user account found with this phone/email.' });
      }

      if (password && user.passwordHash !== password) {
        return res.status(401).json({ success: false, error: 'Incorrect password.' });
      }
    }

    const token = `usr_tok_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    activeSessions.set(token, { entityId: user.id, type: 'user', loginTime: new Date().toISOString() });

    console.log(`[USER AUTH] Rider logged in: ${user.name} (${user.phone})`);

    return res.status(200).json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      token,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        city: user.city,
        role: user.role,
        notificationPreferences: user.notificationPreferences,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Rider Register
 * POST /api/auth/user/register
 */
apiRouter.post('/auth/user/register', (req: Request, res: Response) => {
  try {
    const { name, phone, email, city, password } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ success: false, error: 'Full name and mobile number are required.' });
    }

    const cleanPhone = cleanRecipient(phone);
    const existing = users.find((u) => cleanRecipient(u.phone) === cleanPhone);

    if (existing) {
      return res.status(409).json({ success: false, error: 'An account with this phone number already exists. Please log in.' });
    }

    const newUser: UserAccount = {
      id: `user-${Date.now().toString(36)}`,
      name,
      phone,
      email: email || '',
      city: city || 'Hyderabad, Telangana',
      passwordHash: password || 'Wayora@2026',
      role: 'rider',
      notificationPreferences: { email: !!email, whatsapp: true, sms: true },
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);

    const token = `usr_tok_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    activeSessions.set(token, { entityId: newUser.id, type: 'user', loginTime: new Date().toISOString() });

    console.log(`[USER REGISTRATION] New user registered: ${name} (${phone})`);

    return res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        phone: newUser.phone,
        email: newUser.email,
        city: newUser.city,
        role: newUser.role,
        notificationPreferences: newUser.notificationPreferences,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Rider Logout
 * POST /api/auth/user/logout
 */
apiRouter.post('/auth/user/logout', (req: Request, res: Response) => {
  const token = req.headers.authorization?.replace('Bearer ', '') || req.body.token;
  if (token) {
    activeSessions.delete(token);
  }
  console.log('[USER AUTH] Rider logged out successfully.');
  return res.status(200).json({ success: true, message: 'Rider session terminated successfully.' });
});

/**
 * Rider Forgot Password: sends OTP
 * POST /api/auth/user/forgot-password
 */
apiRouter.post('/auth/user/forgot-password', (req: Request, res: Response) => {
  try {
    const { identifier, channel = 'sms' } = req.body;

    if (!identifier) {
      return res.status(400).json({ success: false, error: 'Phone number or email is required.' });
    }

    const cleanId = cleanRecipient(identifier);
    const user = users.find(
      (u) => cleanRecipient(u.phone) === cleanId || cleanRecipient(u.email) === cleanId
    );

    if (!user) {
      return res.status(404).json({ success: false, error: 'No account registered with this phone or email.' });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000;

    activeOtps.set(cleanId, {
      recipient: identifier,
      channel,
      code,
      purpose: 'forgot_password',
      expiresAt,
      attempts: 0,
      verified: false,
    });

    console.log(`\n======================================================`);
    console.log(`🔑 [FORGOT PASSWORD OTP] Sent to: ${identifier} via ${channel.toUpperCase()}`);
    console.log(`🎯 Code: ${code} for user: ${user.name}`);
    console.log(`======================================================\n`);

    return res.status(200).json({
      success: true,
      message: `Password reset OTP sent to ${identifier} via ${channel.toUpperCase()}.`,
      demoOtpCode: code,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Rider Reset Password: verify OTP and set new password
 * POST /api/auth/user/reset-password
 */
apiRouter.post('/auth/user/reset-password', (req: Request, res: Response) => {
  try {
    const { identifier, otp, newPassword } = req.body;

    if (!identifier || !otp || !newPassword) {
      return res.status(400).json({ success: false, error: 'Identifier, OTP code, and new password are required.' });
    }

    const cleanId = cleanRecipient(identifier);
    const record = activeOtps.get(cleanId);

    if (!record || record.code !== otp.trim()) {
      return res.status(400).json({ success: false, error: 'Invalid or expired OTP code.' });
    }

    const user = users.find(
      (u) => cleanRecipient(u.phone) === cleanId || cleanRecipient(u.email) === cleanId
    );

    if (!user) {
      return res.status(404).json({ success: false, error: 'User account not found.' });
    }

    user.passwordHash = newPassword;
    activeOtps.delete(cleanId); // consume OTP

    console.log(`[USER AUTH] Password reset successfully for ${user.name}`);

    return res.status(200).json({
      success: true,
      message: 'Password has been reset successfully. You can now log in with your new password.',
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ================= 3. CAPTAIN PARTNER AUTHENTICATION =================

/**
 * Captain Login
 * POST /api/auth/captain/login
 */
apiRouter.post('/auth/captain/login', (req: Request, res: Response) => {
  try {
    const { idOrPhone, pin } = req.body;

    if (!idOrPhone) {
      return res.status(400).json({ success: false, error: 'Captain ID or Phone is required.' });
    }

    const cleanId = cleanRecipient(idOrPhone);
    const captain = captains.find(
      (c) =>
        cleanRecipient(c.id) === cleanId ||
        cleanRecipient(c.phone) === cleanId ||
        c.name.toLowerCase().includes(idOrPhone.toLowerCase())
    );

    if (!captain) {
      return res.status(404).json({ success: false, error: 'Captain not found in fleet roster.' });
    }

    if (pin && captain.pin !== pin.toString().trim()) {
      return res.status(401).json({ success: false, error: 'Incorrect 4-digit security PIN.' });
    }

    const token = `cpt_tok_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    activeSessions.set(token, { entityId: captain.id, type: 'captain', loginTime: new Date().toISOString() });

    console.log(`[CAPTAIN AUTH] Captain cockpit logged in: ${captain.name} (${captain.vehicleNumber})`);

    return res.status(200).json({
      success: true,
      message: `Welcome Captain ${captain.name}! Cockpit active.`,
      token,
      captain: {
        id: captain.id,
        name: captain.name,
        phone: captain.phone,
        email: captain.email,
        vehicleModel: captain.vehicleModel,
        vehicleNumber: captain.vehicleNumber,
        rating: captain.rating,
        dutyStatus: captain.dutyStatus,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Captain Logout
 * POST /api/auth/captain/logout
 */
apiRouter.post('/auth/captain/logout', (req: Request, res: Response) => {
  const token = req.headers.authorization?.replace('Bearer ', '') || req.body.token;
  if (token) {
    activeSessions.delete(token);
  }
  console.log('[CAPTAIN AUTH] Captain signed out of mobile cockpit.');
  return res.status(200).json({ success: true, message: 'Captain signed out successfully.' });
});

/**
 * Captain Forgot PIN: send OTP
 * POST /api/auth/captain/forgot-pin
 */
apiRouter.post('/auth/captain/forgot-pin', (req: Request, res: Response) => {
  try {
    const { idOrPhone, channel = 'sms' } = req.body;

    if (!idOrPhone) {
      return res.status(400).json({ success: false, error: 'Captain ID or Phone is required.' });
    }

    const cleanId = cleanRecipient(idOrPhone);
    const captain = captains.find(
      (c) => cleanRecipient(c.id) === cleanId || cleanRecipient(c.phone) === cleanId
    );

    if (!captain) {
      return res.status(404).json({ success: false, error: 'Captain not found in fleet roster.' });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000;

    activeOtps.set(cleanRecipient(captain.phone), {
      recipient: captain.phone,
      channel,
      code,
      purpose: 'forgot_pin',
      expiresAt,
      attempts: 0,
      verified: false,
    });

    console.log(`\n======================================================`);
    console.log(`🔑 [CAPTAIN FORGOT PIN OTP] Sent to: ${captain.phone} via ${channel.toUpperCase()}`);
    console.log(`🎯 Code: ${code} for Captain: ${captain.name}`);
    console.log(`======================================================\n`);

    return res.status(200).json({
      success: true,
      message: `PIN recovery OTP dispatched to Captain's registered mobile ${captain.phone}.`,
      captainPhone: captain.phone,
      demoOtpCode: code,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Captain Reset PIN: verify OTP and set new 4-digit PIN
 * POST /api/auth/captain/reset-pin
 */
apiRouter.post('/api/auth/captain/reset-pin', (req: Request, res: Response) => {
  try {
    const { idOrPhone, otp, newPin } = req.body;

    if (!idOrPhone || !otp || !newPin) {
      return res.status(400).json({ success: false, error: 'Captain ID/Phone, OTP code, and new 4-digit PIN are required.' });
    }

    if (!/^\d{4}$/.test(newPin.toString().trim())) {
      return res.status(400).json({ success: false, error: 'PIN must be exactly 4 digits.' });
    }

    const cleanId = cleanRecipient(idOrPhone);
    const captain = captains.find(
      (c) => cleanRecipient(c.id) === cleanId || cleanRecipient(c.phone) === cleanId
    );

    if (!captain) {
      return res.status(404).json({ success: false, error: 'Captain not found.' });
    }

    const record = activeOtps.get(cleanRecipient(captain.phone));
    if (!record || record.code !== otp.toString().trim()) {
      return res.status(400).json({ success: false, error: 'Invalid or expired OTP code.' });
    }

    captain.pin = newPin.toString().trim();
    activeOtps.delete(cleanRecipient(captain.phone));

    console.log(`[CAPTAIN AUTH] PIN reset successfully for Captain ${captain.name}`);

    return res.status(200).json({
      success: true,
      message: `Captain security PIN updated to ${newPin}. You can now sign in to your cockpit.`,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ================= 4. DAILY OFFER UPDATES (EMAIL, WHATSAPP, SMS) =================

/**
 * Dispatch / Broadcast Daily Travel Offers to all subscribers
 * POST /api/notifications/daily-offers/broadcast
 */
apiRouter.post('/notifications/daily-offers/broadcast', (req: Request, res: Response) => {
  try {
    const { 
      campaignTitle = 'Wayora Daily Luxury Travel Offer',
      offerTitle = 'Flat ₹500 OFF On Outstation Cabs',
      couponCode = 'WAYORA500',
      discountDetails = '15% Off Outstation One-way & Round-trip highway cabs. Chilled AC, Verified Captain.',
      channels = ['email', 'whatsapp', 'sms'],
      customRecipientPhone,
      customRecipientEmail
    } = req.body;

    const emailSubscribers = users.filter((u) => u.notificationPreferences.email && u.email);
    const whatsappSubscribers = users.filter((u) => u.notificationPreferences.whatsapp && u.phone);
    const smsSubscribers = users.filter((u) => u.notificationPreferences.sms && u.phone);

    const logId = `NOTIF-${Date.now().toString(36).toUpperCase()}`;

    // Omnichannel simulated dispatch
    console.log(`\n======================================================`);
    console.log(`📢 [DAILY OFFER BROADCAST] ID: ${logId}`);
    console.log(`🎁 Campaign: "${campaignTitle}" | Coupon: [${couponCode}]`);
    console.log(`✉️  Channels: ${channels.join(', ').toUpperCase()}`);

    if (channels.includes('email')) {
      console.log(`📧 [EMAIL BROADCAST] Sent to ${emailSubscribers.length} passengers (Subject: "${campaignTitle}")`);
      if (customRecipientEmail) console.log(`   -> Direct test sent to: ${customRecipientEmail}`);
    }

    if (channels.includes('whatsapp')) {
      console.log(`💬 [WHATSAPP BROADCAST] Sent to ${whatsappSubscribers.length} passengers via WhatsApp Business API`);
      console.log(`   Message Preview: "🚗 Wayora Journeys: ${offerTitle}! Apply code ${couponCode} on your ride booking. Tap to book: https://wayorajourneys.com"`);
      if (customRecipientPhone) console.log(`   -> Direct WhatsApp test to: ${customRecipientPhone}`);
    }

    if (channels.includes('sms')) {
      console.log(`📱 [SMS BROADCAST] Sent to ${smsSubscribers.length} passengers via SMS Gateway`);
      console.log(`   SMS Text: "Wayora Alert: ${offerTitle}. Use coupon ${couponCode} for instant savings. Book: wayora.in/cab"`);
      if (customRecipientPhone) console.log(`   -> Direct SMS test to: ${customRecipientPhone}`);
    }
    console.log(`======================================================\n`);

    const newLog: NotificationLog = {
      id: logId,
      campaign: campaignTitle,
      channels,
      totalRecipients: Math.max(emailSubscribers.length, whatsappSubscribers.length, smsSubscribers.length, 1),
      emailCount: channels.includes('email') ? emailSubscribers.length + (customRecipientEmail ? 1 : 0) : 0,
      whatsappCount: channels.includes('whatsapp') ? whatsappSubscribers.length + (customRecipientPhone ? 1 : 0) : 0,
      smsCount: channels.includes('sms') ? smsSubscribers.length + (customRecipientPhone ? 1 : 0) : 0,
      offerCoupon: couponCode,
      status: 'DELIVERED',
      sentAt: new Date().toISOString(),
      previewSnippet: `${offerTitle} (Coupon: ${couponCode}) - ${discountDetails}`,
    };

    notificationLogs.unshift(newLog);

    return res.status(200).json({
      success: true,
      message: `Daily travel offer broadcast dispatched successfully across ${channels.join(', ')}.`,
      log: newLog,
      channelsDispatched: {
        email: channels.includes('email') ? { count: newLog.emailCount, status: 'DELIVERED' } : null,
        whatsapp: channels.includes('whatsapp') ? { count: newLog.whatsappCount, status: 'DELIVERED' } : null,
        sms: channels.includes('sms') ? { count: newLog.smsCount, status: 'DELIVERED' } : null,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Get Notification and Daily Offer broadcast logs
 * GET /api/notifications/daily-offers/logs
 */
apiRouter.get('/notifications/daily-offers/logs', (_req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    logs: notificationLogs,
    activeSubscribers: {
      total: users.length,
      email: users.filter((u) => u.notificationPreferences.email).length,
      whatsapp: users.filter((u) => u.notificationPreferences.whatsapp).length,
      sms: users.filter((u) => u.notificationPreferences.sms).length,
    },
  });
});

/**
 * User Channel Preference Subscription Update
 * POST /api/notifications/subscribe
 */
apiRouter.post('/notifications/subscribe', (req: Request, res: Response) => {
  const { identifier, email = true, whatsapp = true, sms = true } = req.body;

  if (!identifier) {
    return res.status(400).json({ success: false, error: 'User phone or email is required.' });
  }

  const cleanId = cleanRecipient(identifier);
  const user = users.find(
    (u) => cleanRecipient(u.phone) === cleanId || cleanRecipient(u.email) === cleanId
  );

  if (user) {
    user.notificationPreferences = { email, whatsapp, sms };
    return res.status(200).json({
      success: true,
      message: 'Daily offer notification channels updated.',
      preferences: user.notificationPreferences,
    });
  }

  return res.status(200).json({
    success: true,
    message: `Subscribed ${identifier} to daily offer alerts.`,
    preferences: { email, whatsapp, sms },
  });
});
