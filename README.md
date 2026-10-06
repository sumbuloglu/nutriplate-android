# NutriPlate Android

Android version of https://sumbuloglu.github.io/nutriplate/ for GAST 4039 Task 4.

The Android Activity displays the original NutriPlate interface in a WebView. All content is bundled in the APK and works offline. The 50 recipes are stored separately in `app/src/main/assets/recipes.json`; ingredient nutrition values are in `foods.json`. `app.js` loads those files and retains the website's calculations, portion control, custom meal builder, and ingredient reference.

## Build without Android Studio

Upload the contents of this project to the root of a GitHub repository with a `main` branch, including `.github/workflows/build.yml`. Do not upload just the ZIP or an extra parent folder.

Open **Actions → Build NutriPlate APK**. A push to main starts the build; **Run workflow** can also start it. The workflow uses Java 17, Gradle 8.9, Android Gradle Plugin 8.7.3, Kotlin 2.0.21 and Android SDK 35. Gradle is installed by the workflow, so a Gradle wrapper is not needed for this build.

When the build succeeds, open the run and download **NutriPlate-APK** from **Artifacts**. Unzip the artifact to obtain `app-debug.apk`. This debug-signed APK is intended for the assignment and can be installed on Android 6.0 or newer. It is not a Play Store release.

## Submission

1. GitHub repository URL.
2. Screenshot of a successful Actions run with a green check.
3. Screenshot of NutriPlate running on an Android phone.

An iPhone cannot install this APK. Use an Android phone for the final screenshot. Follow that phone's installation prompt for the file source you use.

## Checks

The workflow runs Android lint before producing the APK. Local project preparation checks data integrity, XML syntax, and preservation of the original recipes. Successful compilation and device behavior must still be verified through GitHub Actions and an Android phone.
