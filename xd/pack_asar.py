import os
import sys
import shutil

try:
    from asarPy import pack_asar
except ImportError:
    print("Error: asarPy is not installed. Run 'python -m pip install asarPy' first.")
    sys.exit(1)

base_dir = os.path.dirname(__file__)
core_src = os.path.abspath(os.path.join(base_dir, "resources", "app"))
core_dest = os.path.abspath(os.path.join(base_dir, "resources", "app_core.asar"))
bootstrap_dir = os.path.abspath(os.path.join(base_dir, "resources", "app_bootstrap"))
bootstrap_dest = os.path.abspath(os.path.join(base_dir, "resources", "app.asar"))

# ── Step 1: Ensure app_core.asar exists ──────────────────────────────
# If app_core.asar already exists (created by a prior build step), reuse it.
# Otherwise, create it from resources/app/ — but ONLY if main.js has the
# real app code (not the bootstrap). The build script should create
# app_core.asar BEFORE swapping main.js with the bootstrap.
if not os.path.exists(core_dest):
    if os.path.exists(core_src):
        print(f"Creating app_core.asar from: {core_src} -> {core_dest}")
        try:
            pack_asar(core_src, core_dest)
            print("Success! Packed app_core.asar.")
        except Exception as e:
            print(f"Error packing app_core.asar: {e}")
            sys.exit(1)
    else:
        print(f"Warning: Neither {core_dest} nor {core_src} exist — cannot bundle core asar.")
else:
    print(f"app_core.asar already exists ({os.path.getsize(core_dest)} bytes), reusing it.")

# ── Step 2: Bundle app_core.asar into bootstrap directory ────────────
if not os.path.exists(bootstrap_dir):
    print(f"Error: Bootstrap directory {bootstrap_dir} does not exist!")
    sys.exit(1)

bundled_asar = os.path.join(bootstrap_dir, "app_core.asar")
if os.path.exists(core_dest):
    print(f"Bundling app_core.asar into bootstrap: {core_dest} -> {bundled_asar}")
    try:
        shutil.copyfile(core_dest, bundled_asar)
        print("Success! app_core.asar bundled into bootstrap.")
    except Exception as e:
        print(f"Error bundling app_core.asar: {e}")
        sys.exit(1)
else:
    print("Warning: app_core.asar not found, bootstrap will lack bundled fallback.")

# ── Step 3: Pack the bootstrap into app.asar ─────────────────────────
print(f"Packing bootstrap: {bootstrap_dir} -> {bootstrap_dest}")
try:
    if os.path.exists(bootstrap_dest):
        os.remove(bootstrap_dest)
    pack_asar(bootstrap_dir, bootstrap_dest)
    print("Success! Packed app.asar (bootstrap) successfully.")
except Exception as e:
    print(f"Error packing app.asar: {e}")
    sys.exit(1)

# ── Cleanup: remove the bundled asar from bootstrap dir ──────────────
try:
    if os.path.exists(bundled_asar):
        os.remove(bundled_asar)
        print("Cleaned up temporary bundled asar from bootstrap directory.")
except Exception as e:
    print(f"Warning: could not clean up bundled asar: {e}")
