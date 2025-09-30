# Mobile Deployment Guide

## Overview
This app is now configured as an **offline-first mobile application** that can be deployed to both **Google Play Store (Android)** and **Apple App Store (iOS)**.

## Key Features
- ✅ **Offline-first**: All core features work without internet
- ✅ **IndexedDB**: Robust local storage for all data
- ✅ **Background sync**: Automatically syncs when online
- ✅ **Cross-platform**: Single codebase for iOS & Android
- ✅ **Ad-ready**: Prepared for AdMob integration

## Architecture

### Data Storage
- **IndexedDB** (via Dexie.js) - Primary offline database
  - Inventory items
  - Expenses
  - Suppliers
  - Budgets
  - Special orders
  - Sync queue

- **Supabase** - Cloud backup (when online)
  - Automatic background sync
  - Conflict resolution
  - Multi-device support

### Sync Strategy
1. All changes are stored locally first
2. Changes are added to sync queue
3. When online, background sync pushes/pulls data
4. Users see real-time sync status

## Building for Mobile

### Prerequisites
- Node.js installed
- Xcode (for iOS, Mac only)
- Android Studio (for Android)
- GitHub account

### Step 1: Export to GitHub
1. Click **"Export to GitHub"** button in Lovable
2. Create a new repository
3. Clone the repository to your local machine:
```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Add Mobile Platforms

**For Android:**
```bash
npx cap add android
npx cap update android
```

**For iOS (Mac only):**
```bash
npx cap add ios
npx cap update ios
```

### Step 4: Build the Web App
```bash
npm run build
```

### Step 5: Sync with Native Platforms
```bash
npx cap sync
```

**Important:** Run `npx cap sync` every time you:
- Pull new code from GitHub
- Make changes to native capabilities
- Update Capacitor plugins

### Step 6: Run on Device/Emulator

**Android:**
```bash
npx cap run android
```
This opens Android Studio where you can:
- Select an emulator or connected device
- Build and run the app

**iOS (Mac only):**
```bash
npx cap open ios
```
This opens Xcode where you can:
- Select a simulator or connected device
- Configure signing & capabilities
- Build and run the app

## App Store Deployment

### Google Play Store (Android)

1. **Build Release APK/AAB** in Android Studio
   - Build → Generate Signed Bundle/APK
   - Create a keystore (keep it safe!)
   - Build release bundle (AAB)

2. **Create Play Store Listing**
   - Go to [Google Play Console](https://play.google.com/console)
   - Create new app
   - Fill in store listing details
   - Upload screenshots
   - Set content rating
   - Upload AAB file

3. **Required Assets**
   - App icon (512x512 PNG)
   - Feature graphic (1024x500 PNG)
   - Phone screenshots (at least 2)
   - Privacy policy URL

### Apple App Store (iOS)

1. **Configure in Xcode**
   - Open project in Xcode
   - Select signing team
   - Configure bundle identifier
   - Set deployment target (iOS 13.0+)

2. **Build Archive**
   - Product → Archive
   - Once built, click "Distribute App"
   - Choose "App Store Connect"
   - Upload to App Store

3. **Create App Store Listing**
   - Go to [App Store Connect](https://appstoreconnect.apple.com)
   - Create new app
   - Fill in app information
   - Upload screenshots
   - Submit for review

4. **Required Assets**
   - App icon (1024x1024 PNG)
   - Screenshots for different devices
   - Privacy policy URL
   - App description

## Monetization Setup (AdMob)

### Step 1: Create AdMob Account
1. Go to [AdMob](https://admob.google.com)
2. Sign in with Google account
3. Add your app

### Step 2: Install AdMob Plugin
```bash
npm install @capacitor-community/admob
npx cap sync
```

### Step 3: Configure Ad Units
- Create banner ads
- Create interstitial ads
- Create rewarded ads
- Get your Ad Unit IDs

### Step 4: Implement Ads
Update the ad configuration with your Ad Unit IDs and implement ad display logic in the app.

## Testing

### Test Offline Functionality
1. Run app on device
2. Turn off WiFi/data
3. Verify all features work
4. Make changes (add inventory, create invoice, etc.)
5. Turn WiFi back on
6. Verify data syncs automatically

### Test on Multiple Devices
- Test on different screen sizes
- Test on Android and iOS
- Test sync across devices
- Test with slow/intermittent internet

## Hot Reload for Development

The app is configured with hot reload from the Lovable sandbox:
```
https://4a03063f-bb63-4d9e-9cd2-82b2b24bf064.lovableproject.com
```

This means changes you make in Lovable will reflect immediately on your mobile device without rebuilding!

## Troubleshooting

### Sync Issues
- Check browser console for errors
- Verify user is logged in
- Check network connection
- Look at sync queue count

### Build Errors
- Run `npm install` after pulling
- Run `npx cap sync` after changes
- Clean build in Android Studio/Xcode
- Check Capacitor version compatibility

### iOS Signing Issues
- Ensure you have a valid Apple Developer account
- Check bundle identifier matches
- Verify provisioning profiles

## Support & Resources
- [Capacitor Docs](https://capacitorjs.com/docs)
- [Lovable Mobile Blog](https://lovable.dev/blogs)
- [AdMob Documentation](https://developers.google.com/admob)

## Next Steps
1. ✅ Set up mobile environment
2. ✅ Build offline-first architecture
3. 🔄 Integrate AdMob
4. 🔄 Create premium subscription (Stripe)
5. 🔄 Submit to app stores
6. 🔄 Launch & market

---

**Need help?** Check out the [Lovable mobile development blog post](https://lovable.dev/blogs/TODO) for detailed instructions and troubleshooting.
