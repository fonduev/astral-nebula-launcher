import os
import sys
import shutil
import zipfile
import tarfile
import urllib.request

sys.stdout.reconfigure(encoding='utf-8')

BASE_DIR = r"C:\Users\renee\Documents\Web"
VERSION = "5.0.3"
ELECTRON_VERSION = "v43.0.0"
CACHE_DIR = os.path.join(BASE_DIR, "cache")
OUTPUT_DIR = os.path.join(BASE_DIR, "dist")
LINUX_DIR_NAME = f"Nebula-Launcher-v{VERSION}-Linux-x64"
TARGET_DIR = os.path.join(OUTPUT_DIR, LINUX_DIR_NAME)
ASAR_PATH = os.path.join(BASE_DIR, "app.asar")
ICON_PNG = os.path.join(BASE_DIR, "asar_extracted", "icon.png")

print(f"=== BUILD NEBULA LAUNCHER FOR LINUX (v{VERSION}) ===")

# 1. Ensure cache and dist directories
os.makedirs(CACHE_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

# 2. Check app.asar
if not os.path.exists(ASAR_PATH):
    print("Packing app.asar from asar_extracted...")
    import subprocess
    subprocess.run(["cmd.exe", "/c", "npx", "--yes", "asar", "pack", "asar_extracted", "app.asar"], cwd=BASE_DIR, check=True)

print(f"✓ Using app.asar ({os.path.getsize(ASAR_PATH) / (1024 * 1024):.2f} MB)")

# 3. Download Linux Electron runtime if not in cache
electron_zip_name = f"electron-{ELECTRON_VERSION}-linux-x64.zip"
electron_zip_path = os.path.join(CACHE_DIR, electron_zip_name)
electron_url = f"https://github.com/electron/electron/releases/download/{ELECTRON_VERSION}/{electron_zip_name}"

need_download = True
if os.path.exists(electron_zip_path):
    if zipfile.is_zipfile(electron_zip_path):
        need_download = False
        print(f"✓ Using valid cached Electron runtime: {electron_zip_name}")
    else:
        print("⚠️ Cached zip file is incomplete or corrupted. Re-downloading...")
        try: os.remove(electron_zip_path)
        except: pass

if need_download:
    print(f"Downloading Electron Linux runtime ({ELECTRON_VERSION})...")
    print(f"URL: {electron_url}")
    tmp_zip_path = electron_zip_path + ".tmp"
    req = urllib.request.Request(electron_url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as resp, open(tmp_zip_path, 'wb') as out_f:
        total = int(resp.headers.get('content-length', 0))
        downloaded = 0
        while True:
            chunk = resp.read(1024 * 1024)
            if not chunk:
                break
            out_f.write(chunk)
            downloaded += len(chunk)
            if total > 0:
                percent = (downloaded / total) * 100
                print(f"\r  Progress: {percent:.1f}% ({downloaded / (1024 * 1024):.1f}/{total / (1024 * 1024):.1f} MB)", end='', flush=True)
    print("\n✓ Download completed!")
    if os.path.exists(electron_zip_path):
        try: os.remove(electron_zip_path)
        except: pass
    os.rename(tmp_zip_path, electron_zip_path)


# 4. Extract into dist
if os.path.exists(TARGET_DIR):
    shutil.rmtree(TARGET_DIR)
os.makedirs(TARGET_DIR, exist_ok=True)

print(f"Extracting Electron to {TARGET_DIR}...")
with zipfile.ZipFile(electron_zip_path, 'r') as zf:
    zf.extractall(TARGET_DIR)

# 5. Rename executable
orig_exe = os.path.join(TARGET_DIR, "electron")
target_exe = os.path.join(TARGET_DIR, "nebula-launcher")
if os.path.exists(orig_exe):
    os.rename(orig_exe, target_exe)
print("✓ Renamed binary to 'nebula-launcher'")

# 6. Copy app.asar to resources
resources_dir = os.path.join(TARGET_DIR, "resources")
os.makedirs(resources_dir, exist_ok=True)
shutil.copy2(ASAR_PATH, os.path.join(resources_dir, "app.asar"))
# Remove default_app.asar if present
default_app = os.path.join(resources_dir, "default_app.asar")
if os.path.exists(default_app):
    os.remove(default_app)
print("✓ Injected app.asar into resources")

# 7. Add icon
if os.path.exists(ICON_PNG):
    shutil.copy2(ICON_PNG, os.path.join(TARGET_DIR, "nebula-launcher.png"))
    shutil.copy2(ICON_PNG, os.path.join(TARGET_DIR, ".DirIcon"))
    print("✓ Added icons (nebula-launcher.png, .DirIcon)")

# 8. Create desktop file
desktop_file_path = os.path.join(TARGET_DIR, "nebula-launcher.desktop")
desktop_content = """[Desktop Entry]
Name=Nebula Launcher
Comment=Minecraft Launcher con soporte Premium, Forge, NeoForge, Fabric y OptiFine
Exec=nebula-launcher %U
Terminal=false
Type=Application
Icon=nebula-launcher
Categories=Game;
StartupWMClass=Nebula Launcher
"""
with open(desktop_file_path, "w", encoding="utf-8", newline="\n") as f:
    f.write(desktop_content)
print("✓ Created desktop entry file")

# 9. Create AppRun script for AppImage packaging
apprun_path = os.path.join(TARGET_DIR, "AppRun")
apprun_content = """#!/bin/sh
HERE="$(dirname "$(readlink -f "${0}")")"
export PATH="${HERE}:${PATH}"
exec "${HERE}/nebula-launcher" "$@"
"""
with open(apprun_path, "w", encoding="utf-8", newline="\n") as f:
    f.write(apprun_content)
print("✓ Created AppRun entrypoint")

# 10. Create install script for Linux users
install_sh = os.path.join(TARGET_DIR, "install.sh")
install_content = """#!/bin/bash
set -e
echo "🌌 Instalando Nebula Launcher..."

INSTALL_DIR="${HOME}/.local/share/nebula-launcher"
BIN_DIR="${HOME}/.local/bin"
DESKTOP_DIR="${HOME}/.local/share/applications"
ICON_DIR="${HOME}/.local/share/icons/hicolor/256x256/apps"

mkdir -p "${INSTALL_DIR}" "${BIN_DIR}" "${DESKTOP_DIR}" "${ICON_DIR}"

SCRIPT_DIR="$(dirname "$(readlink -f "$0")")"
cp -r "${SCRIPT_DIR}"/* "${INSTALL_DIR}/"

chmod +x "${INSTALL_DIR}/nebula-launcher"
chmod +x "${INSTALL_DIR}/AppRun"

ln -sf "${INSTALL_DIR}/nebula-launcher" "${BIN_DIR}/nebula-launcher"
cp "${INSTALL_DIR}/nebula-launcher.png" "${ICON_DIR}/nebula-launcher.png"

# Actualizar ruta en desktop file
sed -i "s|Exec=nebula-launcher|Exec=${INSTALL_DIR}/nebula-launcher|g" "${INSTALL_DIR}/nebula-launcher.desktop"
cp "${INSTALL_DIR}/nebula-launcher.desktop" "${DESKTOP_DIR}/"

echo "✅ Nebula Launcher instalado correctamente."
echo "Puedes abrirlo desde el menú de aplicaciones o ejecutando 'nebula-launcher' en tu terminal."
"""
with open(install_sh, "w", encoding="utf-8", newline="\n") as f:
    f.write(install_content)
print("✓ Created user-friendly install.sh script")

# 11. Create tar.gz archive
tar_gz_out = os.path.join(OUTPUT_DIR, f"{LINUX_DIR_NAME}.tar.gz")
print(f"Creating portable tar.gz archive: {tar_gz_out}...")
with tarfile.open(tar_gz_out, "w:gz") as tar:
    # Add files preserving relative path
    for root, dirs, files in os.walk(TARGET_DIR):
        for f in files:
            full_p = os.path.join(root, f)
            rel_p = os.path.relpath(full_p, OUTPUT_DIR)
            tar_info = tar.gettarinfo(full_p, arcname=rel_p)
            if f in ['nebula-launcher', 'AppRun', 'install.sh', 'chrome-sandbox']:
                tar_info.mode = 0o755
            tar.addfile(tar_info, open(full_p, 'rb'))

tar_size_mb = os.path.getsize(tar_gz_out) / (1024 * 1024)
print(f"\n🎉 Linux build completed successfully!")
print(f"   Folder:  {TARGET_DIR}")
print(f"   Package: {tar_gz_out} ({tar_size_mb:.2f} MB)")
