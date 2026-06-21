[Setup]
AppName=Nebula Launcher
AppVersion=3.0.1
DefaultDirName={localappdata}\Programs\Nebula Launcher
DefaultGroupName=Nebula Launcher
OutputDir=C:\Users\renee\Documents\Web
OutputBaseFilename=Nebula.Launcher.Setup.3.0.1
SetupIconFile=C:\Users\renee\Documents\Web\icon.ico
Compression=lzma
SolidCompression=yes
DisableProgramGroupPage=yes
DisableDirPage=no
AllowNoIcons=yes
UninstallDisplayIcon={app}\Nebula Launcher.exe
PrivilegesRequired=lowest

[InstallDelete]
Type: filesandordirs; Name: "{app}\resources\app"

[Files]
Source: ".\*"; DestDir: "{app}"; Flags: recursesubdirs createallsubdirs; Excludes: "resources\app\*,resources\app_bootstrap\*,fussionborn.zip,*.asar.bak,*.asar.tmp,*.log,*.txt,compile_*.js,pack_asar.py,setup.iss,err.txt,out.txt,search_debug.txt"

[Icons]
Name: "{group}\Nebula Launcher"; Filename: "{app}\Nebula Launcher.exe"
Name: "{userdesktop}\Nebula Launcher"; Filename: "{app}\Nebula Launcher.exe"; Tasks: desktopicon

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked

[Run]
Filename: "{app}\Nebula Launcher.exe"; Description: "{cm:LaunchProgram,Nebula Launcher}"; Flags: nowait postinstall skipifsilent

[Code]
function GetUninstallString(var UninstallString: String): Boolean;
var
  Subkey: String;
begin
  Result := False;
  
  // 1. Buscar en registro de Usuario (Inno Setup - Nebula Launcher)
  Subkey := 'Software\Microsoft\Windows\CurrentVersion\Uninstall\Nebula Launcher_is1';
  if RegQueryStringValue(HKCU, Subkey, 'UninstallString', UninstallString) then
  begin
    Result := True;
    Exit;
  end;
  
  // 2. Buscar en registro de Usuario (Inno Setup - Astral Nebula Launcher)
  Subkey := 'Software\Microsoft\Windows\CurrentVersion\Uninstall\Astral Nebula Launcher_is1';
  if RegQueryStringValue(HKCU, Subkey, 'UninstallString', UninstallString) then
  begin
    Result := True;
    Exit;
  end;
  
  // 3. Buscar en registro de Usuario (electron-builder / NSIS)
  Subkey := 'Software\Microsoft\Windows\CurrentVersion\Uninstall\astral-nebula-launcher';
  if RegQueryStringValue(HKCU, Subkey, 'UninstallString', UninstallString) then
  begin
    Result := True;
    Exit;
  end;

  // 4. Buscar en registro de Sistema (Inno Setup - Nebula Launcher)
  Subkey := 'Software\Microsoft\Windows\CurrentVersion\Uninstall\Nebula Launcher_is1';
  if RegQueryStringValue(HKLM, Subkey, 'UninstallString', UninstallString) then
  begin
    Result := True;
    Exit;
  end;

  // 5. Buscar en registro de Sistema (Inno Setup - Astral Nebula Launcher)
  Subkey := 'Software\Microsoft\Windows\CurrentVersion\Uninstall\Astral Nebula Launcher_is1';
  if RegQueryStringValue(HKLM, Subkey, 'UninstallString', UninstallString) then
  begin
    Result := True;
    Exit;
  end;
  
  // 6. Buscar en registro de Sistema (electron-builder / NSIS)
  Subkey := 'Software\Microsoft\Windows\CurrentVersion\Uninstall\astral-nebula-launcher';
  if RegQueryStringValue(HKLM, Subkey, 'UninstallString', UninstallString) then
  begin
    Result := True;
    Exit;
  end;
end;

function InitializeSetup(): Boolean;
var
  UninstallString: String;
  UninstallFlags: String;
  ResultCode: Integer;
begin
  Result := True;
  if GetUninstallString(UninstallString) then
  begin
    // Limpiar comillas si el valor del registro las incluye
    if Pos('"', UninstallString) = 1 then
    begin
      UninstallString := Copy(UninstallString, 2, Length(UninstallString) - 2);
    end;
    
    // Determinar si es desinstalador de NSIS (/S) o de Inno Setup (/VERYSILENT)
    if Pos('Uninstall', UninstallString) > 0 then
    begin
      UninstallFlags := '/S';
    end
    else
    begin
      UninstallFlags := '/SILENT /VERYSILENT /SUPPRESSMSGBOXES /NORESTART';
    end;
    
    // Ejecutar desinstalación en segundo plano y esperar a que termine
    Exec(UninstallString, UninstallFlags, '', SW_HIDE, ewWaitUntilTerminated, ResultCode);
  end;
end;
