; Script de Instalación de Inno Setup para Nebula Launcher v4.1.2 (Multilenguaje)
#define MyAppName "Nebula Launcher"
#define MyAppVersion "4.3.0"
#define MyAppPublisher "Nebula Studios"
#define MyAppURL "https://nebuladevstudios.com"
#define MyAppExeName "Nebula Launcher.exe"

[Setup]
PrivilegesRequired=lowest
AppId={{D37E7492-7E11-4775-8D44-2DDF669D503C}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}
AppUpdatesURL={#MyAppURL}
DefaultDirName={localappdata}\Programs\{#MyAppName}
DisableProgramGroupPage=yes
OutputBaseFilename=Nebula.Launcher.Setup.4.3.0
OutputDir=C:\Users\renee\Documents\Web
Compression=lzma
SolidCompression=yes
WizardStyle=modern

[Languages]
Name: "spanish"; MessagesFile: "compiler:Languages\Spanish.isl"
Name: "english"; MessagesFile: "compiler:Default.isl"
Name: "portuguese"; MessagesFile: "compiler:Languages\Portuguese.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked

[Files]
Source: "C:\Users\renee\AppData\Local\Programs\Nebula Launcher\{#MyAppExeName}"; DestDir: "{app}"; Flags: ignoreversion
Source: "C:\Users\renee\AppData\Local\Programs\Nebula Launcher\*"; Excludes: "*nul*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{autoprograms}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"
Name: "{autodesktop}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; Tasks: desktopicon

[Run]
Filename: "{app}\{#MyAppExeName}"; Description: "{cm:LaunchProgram,{#StringChange(MyAppName, '&', '&&')}}"; Flags: nowait postinstall skipifsilent
