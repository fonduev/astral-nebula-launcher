import os
import urllib.request
import zipfile
import subprocess
import shutil

# Paths
SCRATCH_DIR = r"C:\Users\renee\.gemini\antigravity\brain\9696395f-9e94-436a-842e-82cc6f902f93\scratch"
BUILD_DIR = os.path.join(SCRATCH_DIR, "agent_build")
SRC_DIR = os.path.join(BUILD_DIR, "src", "nebula", "agent")
BIN_DIR = os.path.join(BUILD_DIR, "bin")

JAVASSIST_URL = "https://repo1.maven.org/maven2/org/javassist/javassist/3.29.2-GA/javassist-3.29.2-GA.jar"
JAVASSIST_JAR = os.path.join(BUILD_DIR, "javassist.jar")

JAVAC_PATH = r"C:\Users\renee\AppData\Roaming\astral-nebula-launcher\runtimes\java17\jdk-17.0.19+10\bin\javac.exe"
JAR_PATH = r"C:\Users\renee\AppData\Roaming\astral-nebula-launcher\runtimes\java17\jdk-17.0.19+10\bin\jar.exe"

def build():
    # Clean and recreate dirs
    if os.path.exists(BUILD_DIR):
        shutil.rmtree(BUILD_DIR)
    os.makedirs(SRC_DIR, exist_ok=True)
    os.makedirs(BIN_DIR, exist_ok=True)

    # 1. Download Javassist
    print("Descargando Javassist...")
    urllib.request.urlretrieve(JAVASSIST_URL, JAVASSIST_JAR)
    print("Javassist descargado.")

    # 2. Write Java Agent source code
    java_src = """package nebula.agent;

import java.lang.instrument.Instrumentation;
import java.lang.instrument.ClassFileTransformer;
import java.security.ProtectionDomain;
import javassist.*;

public class NebulaSkinAgent {
    public static String databaseUrl = "";

    public static void premain(String agentArgs, Instrumentation inst) {
        if (agentArgs != null && !agentArgs.isEmpty()) {
            databaseUrl = agentArgs;
        }
        System.out.println("[NebulaAgent] Inicializado con DB: " + databaseUrl);
        inst.addTransformer(new ClassFileTransformer() {
            @Override
            public byte[] transform(ClassLoader loader, String className, Class<?> classBeingRedefined,
                                    ProtectionDomain protectionDomain, byte[] classfileBuffer) {
                if (className == null) return null;
                if (className.equals("com/mojang/authlib/yggdrasil/YggdrasilMinecraftSessionService")) {
                    try {
                        System.out.println("[NebulaAgent] Modificando YggdrasilMinecraftSessionService...");
                        ClassPool cp = ClassPool.getDefault();
                        cp.insertClassPath(new ByteArrayClassPath(className.replace('/', '.'), classfileBuffer));
                        cp.insertClassPath(new LoaderClassPath(loader));
                        
                        CtClass cc = cp.get("com.mojang.authlib.yggdrasil.YggdrasilMinecraftSessionService");
                        
                        // 1. Agregar campo estatico nebulaDatabaseUrl
                        CtField dbField = new CtField(cp.get("java.lang.String"), "nebulaDatabaseUrl", cc);
                        dbField.setModifiers(Modifier.PUBLIC | Modifier.STATIC);
                        cc.addField(dbField, CtField.Initializer.constant(databaseUrl));
                        
                        // 2. Agregar metodo fetchUrl
                        CtMethod fetchUrlMethod = CtMethod.make(
                            "private static String fetchUrl(String urlString) {\\n" +
                            "    java.io.BufferedReader reader = null;\\n" +
                            "    try {\\n" +
                            "        java.net.URL url = new java.net.URL(urlString);\\n" +
                            "        java.net.HttpURLConnection conn = (java.net.HttpURLConnection) url.openConnection();\\n" +
                            "        conn.setRequestMethod(\\"GET\\");\\n" +
                            "        conn.setConnectTimeout(2000);\\n" +
                            "        conn.setReadTimeout(2000);\\n" +
                            "        int responseCode = conn.getResponseCode();\\n" +
                            "        if (responseCode == 200) {\\n" +
                            "            reader = new java.io.BufferedReader(new java.io.InputStreamReader(conn.getInputStream(), \\"UTF-8\\"));\\n" +
                            "            StringBuilder sb = new StringBuilder();\\n" +
                            "            String line;\\n" +
                            "            while ((line = reader.readLine()) != null) {\\n" +
                            "                sb.append(line);\\n" +
                            "            }\\n" +
                            "            return sb.toString();\\n" +
                            "        }\\n" +
                            "    } catch (Exception e) {\\n" +
                            "        // Ignorar\\n" +
                            "    } finally {\\n" +
                            "        try {\\n" +
                            "            if (reader != null) reader.close();\\n" +
                            "        } catch (Exception e) {}\\n" +
                            "    }\\n" +
                            "    return null;\\n" +
                            "}", cc);
                        cc.addMethod(fetchUrlMethod);

                        // 3. Agregar metodo fillNebulaProfile
                        CtMethod fillNebulaProfileMethod = CtMethod.make(
                            "public static Object fillNebulaProfile(Object gameProfileObj) {\\n" +
                            "    if (gameProfileObj == null) return null;\\n" +
                            "    try {\\n" +
                            "        String name = (String) gameProfileObj.getClass().getMethod(\\"getName\\", null).invoke(gameProfileObj, null);\\n" +
                            "        java.util.UUID uuid = (java.util.UUID) gameProfileObj.getClass().getMethod(\\"getId\\", null).invoke(gameProfileObj, null);\\n" +
                            "        if (name == null || uuid == null) return null;\\n" +
                            "        if (nebulaDatabaseUrl == null || nebulaDatabaseUrl.isEmpty()) return null;\\n" +
                            "        String q = String.valueOf((char)34);\\n" +
                            "        String queryUrl = nebulaDatabaseUrl + \\"/users.json?orderBy=\\" + q + \\"uuid\\" + q + \\"&equalTo=\\" + q + uuid.toString() + q;\\n" +
                            "        String json = fetchUrl(queryUrl);\\n" +
                            "        if (json == null || json.trim().equals(\\"{}\\") || json.trim().equals(\\"null\\")) {\\n" +
                            "            return null;\\n" +
                            "        }\\n" +
                            "        String skinUrl = null;\\n" +
                            "        String skinUrlKey = q + \\"skinUrl\\" + q + \\":\\" + q;\\n" +
                            "        int skinUrlIdx = json.indexOf(skinUrlKey);\\n" +
                            "        if (skinUrlIdx != -1) {\\n" +
                            "            int start = skinUrlIdx + skinUrlKey.length();\\n" +
                            "            int end = json.indexOf(q, start);\\n" +
                            "            if (end != -1) {\\n" +
                            "                skinUrl = json.substring(start, end);\\n" +
                            "            }\\n" +
                            "        }\\n" +
                            "        if (skinUrl == null || skinUrl.trim().isEmpty()) {\\n" +
                            "            return null;\\n" +
                            "        }\\n" +
                            "        String uuidNoDashes = uuid.toString().replace(\\"-\\", \\"\\");\\n" +
                            "        String texturesJson = \\"{\\" + q + \\"timestamp\\" + q + \\":\\" + System.currentTimeMillis() + \\",\\" + q + \\"profileId\\" + q + \\":\\" + q + uuidNoDashes + q + \\",\\" + q + \\"profileName\\" + q + \\":\\" + q + name + q + \\",\\" + q + \\"textures\\" + q + \\":{\\" + q + \\"SKIN\\" + q + \\":{\\" + q + \\"url\\" + q + \\":\\" + q + skinUrl + q + \\"}}}\\";\\n" +
                            "        String texturesBase64 = java.util.Base64.getEncoder().encodeToString(texturesJson.getBytes(\\"UTF-8\\"));\\n" +
                            "        Object properties = gameProfileObj.getClass().getMethod(\\"getProperties\\", null).invoke(gameProfileObj, null);\\n" +
                            "        Class propertyClass = Class.forName(\\"com.mojang.authlib.properties.Property\\");\\n" +
                            "        Object texturesProperty = null;\\n" +
                            "        try {\\n" +
                            "            java.lang.reflect.Constructor constr = propertyClass.getConstructor(new Class[] { String.class, String.class, String.class });\\n" +
                            "            texturesProperty = constr.newInstance(new Object[] { \\"textures\\", texturesBase64, null });\\n" +
                            "        } catch (Exception e) {\\n" +
                            "            java.lang.reflect.Constructor constr = propertyClass.getConstructor(new Class[] { String.class, String.class });\\n" +
                            "            texturesProperty = constr.newInstance(new Object[] { \\"textures\\", texturesBase64 });\\n" +
                            "        }\\n" +
                            "        java.lang.reflect.Method putMethod = properties.getClass().getMethod(\\"put\\", new Class[] { Object.class, Object.class });\\n" +
                            "        putMethod.invoke(properties, new Object[] { \\"textures\\", texturesProperty });\\n" +
                            "        System.out.println(\\"[NebulaAgent] Skin cargada exitosamente para: \\" + name + \\" -> \\" + skinUrl);\\n" +
                            "        return gameProfileObj;\\n" +
                            "    } catch (Exception e) {\\n" +
                            "        System.err.println(\\"[NebulaAgent] Error al procesar skin de Nebula: \\" + e.getMessage());\\n" +
                            "        e.printStackTrace();\\n" +
                            "    }\\n" +
                            "    return null;\\n" +
                            "}", cc);
                        cc.addMethod(fillNebulaProfileMethod);

                        CtMethod[] methods = cc.getDeclaredMethods();
                        for (CtMethod m : methods) {
                            if (m.getName().equals("fillProfileProperties")) {
                                System.out.println("[NebulaAgent] Transformando metodo: " + m.getLongName());
                                m.insertBefore("{ Object customProfile = fillNebulaProfile($1); if (customProfile != null) return (com.mojang.authlib.GameProfile) customProfile; }");
                            }
                        }
                        byte[] byteCode = cc.toBytecode();
                        cc.detach();
                        return byteCode;
                    } catch (Exception e) {
                        System.err.println("[NebulaAgent] Error al transformar clase: " + e.getMessage());
                        e.printStackTrace();
                    }
                }
                return null;
            }
        });
    }
}
"""
    with open(os.path.join(SRC_DIR, "NebulaSkinAgent.java"), "w", encoding="utf-8") as f:
        f.write(java_src)

    # 3. Write Manifest
    manifest_dir = os.path.join(BUILD_DIR, "src", "META-INF")
    os.makedirs(manifest_dir, exist_ok=True)
    manifest_content = """Manifest-Version: 1.0
Premain-Class: nebula.agent.NebulaSkinAgent
Can-Redefine-Classes: true
Can-Retransform-Classes: true
"""
    with open(os.path.join(manifest_dir, "MANIFEST.MF"), "w", encoding="utf-8") as f:
        f.write(manifest_content)

    # 4. Compile Java source
    print("Compilando Java Agent...")
    cmd_compile = [
        JAVAC_PATH,
        "-cp", JAVASSIST_JAR,
        "-d", BIN_DIR,
        os.path.join(SRC_DIR, "NebulaSkinAgent.java")
    ]
    res = subprocess.run(cmd_compile, capture_output=True, text=True)
    if res.returncode != 0:
        print("Error en compilación:")
        print(res.stderr)
        return False
    print("Compilación exitosa.")

    # 5. Extract Javassist class files to shaded bin
    print("Descomprimiendo Javassist para sombreado...")
    with zipfile.ZipFile(JAVASSIST_JAR, 'r') as zip_ref:
        zip_ref.extractall(BIN_DIR)

    # 6. Package final jar
    print("Creando nebula-skin-agent.jar...")
    manifest_file = os.path.join(manifest_dir, "MANIFEST.MF")
    dest_jar = os.path.join(SCRATCH_DIR, "nebula-skin-agent.jar")
    
    cmd_jar = [
        JAR_PATH,
        "cfm", dest_jar,
        manifest_file,
        "-C", BIN_DIR,
        "."
    ]
    res = subprocess.run(cmd_jar, capture_output=True, text=True)
    if res.returncode != 0:
        print("Error al crear JAR:")
        print(res.stderr)
        return False
    
    print(f"JAR creado exitosamente en {dest_jar}")

    # 7. Copy to launcher resources folder
    target_resources_dir = r"C:\Users\renee\Documents\Web\xd\resources\app"
    shutil.copy(dest_jar, os.path.join(target_resources_dir, "nebula-skin-agent.jar"))
    print(f"JAR copiado a {target_resources_dir}")
    return True

if __name__ == "__main__":
    build()
