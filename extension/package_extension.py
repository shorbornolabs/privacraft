import os
import zipfile
import json

def package():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    zip_name = "privacraft-v1.0.0.zip"
    zip_path = os.path.join(base_dir, zip_name)

    if os.path.exists(zip_path):
        os.remove(zip_path)

    # Production extension files to include
    include_files = [
        "manifest.json",
        "popup.html",
        "offscreen.html",
    ]
    include_dirs = [
        "icons",
        "scripts",
        "styles",
    ]

    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
        # Add root files
        for f in include_files:
            fp = os.path.join(base_dir, f)
            if os.path.exists(fp):
                zf.write(fp, f)
                print(f"Added file: {f}")

        # Add directories
        for d in include_dirs:
            dp = os.path.join(base_dir, d)
            for root, _, files in os.walk(dp):
                for file in files:
                    full_path = os.path.join(root, file)
                    arcname = os.path.relpath(full_path, base_dir)
                    zf.write(full_path, arcname)
                    print(f"Added file: {arcname}")

    size_kb = os.path.getsize(zip_path) / 1024
    print(f"\n[SUCCESS] Packaged {zip_name} ({size_kb:.1f} KB) ready for Chrome Web Store upload!")

if __name__ == "__main__":
    package()
