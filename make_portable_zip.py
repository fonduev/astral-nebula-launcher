import os
import zipfile

src_dir = r"c:\Users\renee\Documents\Web\xd"
zip_path = r"c:\Users\renee\Documents\Web\Nebula-Launcher-v4.0.4-Portable.zip"

files_to_include = [
    "Nebula Launcher.exe",
    "chrome_100_percent.pak",
    "chrome_200_percent.pak",
    "resources.pak",
    "snapshot_blob.bin",
    "v8_context_snapshot.bin",
    "icudtl.dat",
    "vk_swiftshader_icd.json",
    "d3dcompiler_47.dll",
    "ffmpeg.dll",
    "libEGL.dll",
    "libGLESv2.dll",
    "vk_swiftshader.dll",
    "vulkan-1.dll",
    "LICENSE.electron.txt",
    "LICENSES.chromium.html"
]

dirs_to_include = ["resources", "locales"]

print(f"Creating portable zip at {zip_path}...")
with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as z:
    for filename in files_to_include:
        filepath = os.path.join(src_dir, filename)
        if os.path.exists(filepath):
            arcname = os.path.join("Nebula-Launcher-v4.0.4-Portable", filename)
            z.write(filepath, arcname)
            print(f"Added {filename}")

    for dirname in dirs_to_include:
        dirpath = os.path.join(src_dir, dirname)
        if os.path.exists(dirpath):
            for root, dirs, files in os.walk(dirpath):
                for f in files:
                    if f.lower() == 'nul':
                        continue
                    full_path = os.path.join(root, f)
                    try:
                        rel_path = os.path.relpath(full_path, src_dir)
                        arcname = os.path.join("Nebula-Launcher-v4.0.4-Portable", rel_path)
                        z.write(full_path, arcname)
                    except Exception as e:
                        print(f"Skipping {f}: {e}")
            print(f"Added directory {dirname}")

print(f"Portable ZIP created successfully! Size: {os.path.getsize(zip_path)} bytes")
