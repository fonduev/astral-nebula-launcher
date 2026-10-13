(() => {
  const translations = {
    es: {
      language: 'es',
      title: {
        guides: 'Centro de Guías, Tutoriales y Artículos de Minecraft | Nebula',
        about: 'Acerca de Nosotros | Nebula Dev Studios',
        contact: 'Contacto y soporte | Nebula Dev Studios'
      },
      description: {
        guides: 'Guías prácticas sobre Minecraft: rendimiento, Java, mods, errores, shaders y servidores. Consulta versiones, pasos y fuentes antes de aplicar cambios.',
        about: 'Conoce el proyecto independiente Nebula Dev Studios, su launcher, documentación y canales públicos de contacto.',
        contact: 'Contacta con Nebula Dev Studios por correo, Discord o GitHub Issues para consultas y reportes sobre Nebula Launcher.'
      },
      nav: ['Inicio', 'Guías y artículos', 'Acerca de', 'Metodología', 'Contacto', 'Descargar launcher'],
      footer: {
        project: 'Proyecto independiente de software y documentación relacionada con Minecraft.',
        headings: ['Navegación', 'Recursos', 'Legal'],
        home: 'Inicio',        guides: 'Guías y tutoriales', about: 'Acerca del proyecto', contact: 'Contacto',
      privacy: 'Política de privacidad', terms: 'Términos del servicio', source: 'Código en GitHub',
      performance: 'Optimización de FPS', mods: 'Instalación de mods', errors: 'Solución de errores',
        privacy: 'Política de privacidad', terms: 'Términos del servicio', report: 'Reportar un problema',
        copyright: '© 2026 Nebula Dev Studios. Todos los derechos reservados.',
        disclaimer: 'NO ES UN PRODUCTO OFICIAL DE MINECRAFT. NO ESTÁ APROBADO NI ASOCIADO CON MOJANG O MICROSOFT.',
        trademark: 'Minecraft es una marca comercial de Mojang Synergies AB / Microsoft Corporation.'
      },
      cookie: {
        message: '🍪 <strong>Aviso de privacidad:</strong> Este sitio puede cargar recursos y servicios de terceros. El botón solo cierra este aviso; no registra ni transmite una elección de consentimiento publicitario. Consulta la <a href="privacy.html">Política de privacidad</a> y los <a href="terms.html">Términos</a>.',
        close: 'Cerrar aviso'
      },
      about: {
        hero: ['✦ Misión y filosofía', 'Acerca de Nebula Dev Studios', 'Nebula Launcher es un proyecto independiente relacionado con Minecraft. En este sitio compartimos información sobre el software, sus guías, formas de contacto y enlaces a los recursos del proyecto.'],
        stats: [['Guías', 'Documentación de Minecraft'], ['2024', 'Inicio del proyecto'], ['GitHub', 'Código y proyectos'], ['Contacto', 'Soporte y correcciones']],
        story: ['🪐 Nuestra historia', 'comenzó como un proyecto independiente en 2024. Su actividad principal es desarrollar Nebula Launcher y publicar documentación y guías relacionadas con Minecraft y sus herramientas.', 'Nebula Launcher está desarrollado con Electron, TypeScript y Node.js. La interfaz incluye opciones visuales que pueden cambiar entre versiones; consulta la release y sus notas para conocer los formatos y ajustes disponibles.', 'El launcher reúne herramientas para administrar perfiles de Minecraft y acceder a recursos de mods. Las funciones disponibles dependen de la versión instalada; consulta las notas de publicación y los repositorios enlazados para confirmar su alcance actual.'],
        values: ['✨ Nuestros pilares', 'Al desarrollar software y publicar documentación, buscamos mantener el proyecto comprensible, útil y transparente sobre su alcance y sus límites.', ['Rendimiento', 'Revisamos el uso de recursos y la respuesta de la interfaz durante el desarrollo; el rendimiento puede variar entre equipos y configuraciones.'], ['Privacidad y transparencia', 'Explicamos el tratamiento de datos y el uso de tecnologías web en nuestra <a href="./privacy.html">Política de privacidad</a>. Los servicios externos pueden recopilar datos según su configuración y las preferencias de consentimiento.'], ['Diseño y estética', 'Creemos que las herramientas técnicas deben ser fáciles de usar. Diseñamos una interfaz con estética cósmica, tipografía clara y microinteracciones.']],
        ecosystem: ['🤝 Compromiso con el ecosistema abierto', 'El ecosistema de Minecraft incluye cargadores y catálogos independientes. La compatibilidad de cada perfil depende del archivo, la versión del juego, el cargador y las dependencias que indiquen sus autores; confirma esos datos antes de instalar.', 'El código y los reportes públicos del proyecto pueden consultarse en <a href="https://github.com/fonduev/astral-nebula-launcher" target="_blank" rel="noopener">GitHub</a>. Revisa el repositorio para conocer la actividad, la licencia y las opciones de contribución vigentes.'],
        contact: ['📬 Contacto y transparencia', 'Para consultas o sugerencias sobre el proyecto, puedes escribir a <a href="mailto:soporte@nebuladevstudios.com" style="color:var(--accent-cyan);font-weight:600;">soporte@nebuladevstudios.com</a> o usar los canales indicados en nuestro <a href="./contact.html" style="color:var(--accent-purple);font-weight:600;text-decoration:underline;">Centro de contacto</a>.']
      },
      contact: {
        hero: ['✦ Centro de soporte y ayuda', 'Contacto y soporte de Nebula Launcher', 'Para consultas, sugerencias o reportes, utiliza uno de los canales disponibles. La respuesta y los tiempos de atención dependen de la disponibilidad del equipo y de la comunidad.'],
        channels: [['Comunidad en Discord', 'Consulta novedades o pide orientación a la comunidad. La disponibilidad de respuestas depende de las personas que participen en el servidor.', 'Unirse a Discord →'], ['Correo electrónico', 'Para consultas comerciales, reportes de seguridad, colaboraciones institucionales y soporte directo.', 'soporte@nebuladevstudios.com →'], ['GitHub Issues', 'Reporta fallos técnicos, adjunta registros pertinentes y solicita nuevas funciones en el repositorio del proyecto.', 'Ver repositorio →']],
        form: ['Envíanos un mensaje', 'Completa el mensaje y se abrirá tu aplicación de correo predeterminada para que puedas revisarlo y enviarlo. El mensaje no se envía desde este sitio.', ['Nombre o apodo *', 'Tu nombre o nick de Minecraft'], ['Correo electrónico *', 'tuemail@ejemplo.com'], 'Motivo del contacto *', 'Selecciona una opción...', ['Soporte técnico / problema al iniciar', 'Reporte de error', 'Sugerencia de una función', 'Colaboración / servidor / creador de contenido', 'Otro motivo'], 'Mensaje detallado *', 'Describe tu consulta o el error. Si corresponde, incluye la versión de Minecraft y tu sistema operativo.', 'Abrir correo para enviar el mensaje'],
        faq: ['Preguntas frecuentes', ['¿Nebula Launcher es compatible con cuentas de Microsoft?', 'Consulta la documentación de la versión que estás usando para conocer las opciones de cuenta y los permisos que solicita el flujo de autenticación.'], ['¿Qué debo hacer si Minecraft no inicia o muestra "Exit Code 1"?', 'Exit Code 1 es un resultado genérico. Revisa el registro, Java, el cargador y los mods; nuestra <a href="./guias/exit-code-1-minecraft-solucion.html">guía de diagnóstico</a> explica por dónde empezar.'], ['¿Dónde puedo consultar el código y las versiones?', 'Revisa el <a href="https://github.com/fonduev/astral-nebula-launcher" target="_blank" rel="noopener">repositorio de GitHub</a> y sus releases. La publicación del código no sustituye una auditoría de seguridad independiente; verifica el origen de los archivos que descargues.'], ['¿Cómo instalo modpacks de CurseForge o Modrinth?', 'La interfaz y las opciones de importación pueden variar según la versión. Antes de instalar, comprueba el modpack, el cargador, la versión de Minecraft y las dependencias; consulta las notas de la release si tienes dudas.']]
      },
      guides: {
        hero: ['✦ Guías y recursos de Minecraft', 'Guías y tutoriales para Minecraft', 'Guías prácticas de Minecraft sobre rendimiento, mods, Java, errores y servidores. Revisa las versiones y fuentes indicadas antes de aplicar cambios.'],
        filters: ['✦ Todos los artículos', '⚡ Rendimiento y FPS', '🛠️ Soporte y registros', '☕ Java y JVM', '📦 Mods y NeoForge', '🎨 Shaders', '🌐 Servidores'],
        cards: [
          ['⚡ Rendimiento y FPS', 'Cómo diagnosticar y mejorar el rendimiento de Minecraft', 'Revisa qué optimiza cada mod, confirma versión y cargador compatibles, y prueba cambios por separado para detectar conflictos.'],
          ['⚡ Rendimiento y FPS', 'Mods de rendimiento para Fabric: qué optimiza cada categoría', 'Compara optimizaciones de renderizado, lógica y memoria; revisa dependencias y compatibilidad, y añade mods de uno en uno.'],
          ['⚡ Memoria RAM', 'Cuánta RAM asignar a Minecraft: cómo ajustar el heap sin adivinar', 'Aprende a ajustar el heap según el uso real, distinguir falta de memoria de otros problemas y cambiar la configuración por pasos.'],
          ['⚡ Ajustes para 4 GB', 'Minecraft en un equipo con 4 GB de RAM: límites y ajustes', 'Reconoce los límites de memoria de un equipo modesto y prioriza ajustes que no agoten los recursos de Windows.'],
          ['⚡ Rendimiento en HDD', 'Minecraft en HDD: diagnóstico de pausas y ajustes seguros', 'Diagnostica pausas de carga en HDD, revisa el espacio y la actividad del disco y prueba cambios seguros antes de tocar los archivos del mundo.'],
          ['⚡ Comparación de mods', 'Sodium vs OptiFine: diferencias, compatibilidad y cómo elegir', 'Compara funciones y compatibilidad por versión, y sigue una prueba controlada para elegir el perfil adecuado para tus mods y tu equipo.'],
          ['⚡ Ajustes gráficos', 'Distancia de renderizado y simulación: qué cambia', 'Entiende qué chunks se muestran y cuáles siguen activos; ajusta ambas distancias con una prueba controlada en tu mundo.'],
          ['🛠️ Exit Code 1', 'Exit Code 1 en Minecraft: guía de diagnóstico', 'Revisa el mensaje del launcher, el registro y las versiones de Java, cargador y mods antes de probar un cambio reversible.'],
          ['🔍 Diagnóstico de registros', 'Cómo leer latest.log y crash reports', 'Usa latest.log y el crash report, si existe, como pistas; contrasta el stack trace con versiones y dependencias antes de atribuir un fallo.'],
          ['🛠️ Solución de problemas', 'Errores comunes de Minecraft: cómo iniciar el diagnóstico', 'Usa los mensajes de error y los registros para revisar heap, runtime, dependencias de mods y problemas gráficos antes de cambiar archivos.'],
          ['🛠️ Error de OpenGL', 'Pantalla blanca y errores OpenGL 65542/65543 en Minecraft', 'Revisa el mensaje completo, el controlador y la GPU seleccionada. Un error OpenGL no demuestra que Java sea la causa ni que debas reemplazar archivos del controlador.'],
          ['🛠️ Memoria', 'Consumo de memoria en Minecraft con mods: diagnóstico con Spark', 'Separa falta de heap, memoria del sistema y posibles fugas; reúne un registro y una prueba repetible antes de cambiar la JVM.'],
          ['🔍 Diagnóstico de lag', 'Diferencia entre FPS, TPS y MSPT: qué medir', 'Distingue FPS bajos de ticks lentos y usa la medición adecuada para buscar el cuello de botella en el cliente o el servidor.'],
          ['☕ Entorno Java', 'Guía de versiones de Java para Minecraft: Java 8, 17 y 21', 'Comprueba qué runtime necesita tu perfil y cómo identificar la versión de Java que eligió el launcher.'],
          ['☕ Compatibilidad Java', 'Java 8, Java 17 y Java 21: requisitos y compatibilidad', 'Comprueba los requisitos publicados del juego, cargador y mods cuando encuentres un error de compatibilidad de clases.'],
          ['⚙️ Flags JVM', 'Argumentos JVM para Minecraft: qué revisar y qué evitar', 'Entiende el heap, revisa las opciones JVM compatibles y compara un cambio solo cuando tengas un motivo y puedas repetir la prueba.'],
          ['☕ ZGC vs G1GC', 'ZGC o G1GC en Minecraft: diferencias y cómo compararlos', 'Compara G1GC y ZGC, revisa qué cambia por versión de Java y mide una configuración sin asumir que una receta sirve para todos.'],
          ['📦 Mods y cargadores', 'Cómo instalar y administrar mods en Fabric, Forge y NeoForge', 'Revisa la versión, el cargador y las dependencias de cada archivo; instala perfiles sin mezclar configuraciones ni mundos.'],
          ['📦 NeoForge vs Fabric', 'NeoForge vs Fabric: cómo elegir para tus modpacks y shaders', 'Compara la disponibilidad de mods y versiones; comprueba el cargador y la versión de Minecraft en las páginas de cada proyecto.'],
          ['📁 Perfiles separados', 'Cómo crear instancias separadas en Minecraft y aislar mods', 'Separa mods, opciones y mundos por perfil para probar cargadores distintos y poder revertir los cambios con facilidad.'],
          ['🎨 Shaders y gráficos', 'Cómo elegir shaders para Minecraft: estilo, opciones y compatibilidad', 'Compara estilos y controles visuales, verifica la compatibilidad y prueba cada pack con los mismos ajustes; no hay FPS universales.'],
          ['🎨 GPU integrada', 'Cómo elegir shaders para Minecraft en una GPU integrada', 'Comprueba el modelo de GPU, las versiones compatibles y los ajustes del pack; compara resultados en tu equipo con una prueba repetible.'],
          ['🎨 Alternativas a OptiFine', 'OptiFine en Minecraft: cuándo usarlo y qué alternativas tienes', 'Compara OptiFine, Sodium e Iris, revisa la compatibilidad por versión y cambia de perfil conservando tus mundos.'],
          ['🌐 Servidores Paper/Purpur', 'Cómo crear un servidor de Minecraft con Paper o Purpur', 'Prepara la instalación, acepta el EULA, inicia el servidor y planifica el acceso remoto sin exponer servicios innecesarios.'],
          ['🌐 Rendimiento del servidor', 'Cómo diagnosticar y optimizar un servidor Paper', 'Mide TPS y duración de ticks con spark, localiza el origen de la carga y prueba ajustes reversibles según la documentación de Paper.']
        ],
        readMore: 'Leer la guía completa →',
        footer: {
          project: 'Proyecto independiente con guías y documentación relacionada con Minecraft.',
          headings: ['Navegación', 'Recursos', 'Legal'],
          home: 'Inicio', guides: 'Guías y tutoriales', about: 'Acerca del proyecto', contact: 'Contacto',
          performance: 'Optimización de FPS', mods: 'Instalación de mods', errors: 'Solución de errores', source: 'Código en GitHub',
          privacy: 'Política de privacidad', terms: 'Términos del servicio', copyright: '© 2026 Nebula Dev Studios. Todos los derechos reservados.',
          disclaimer: 'NO ES UN PRODUCTO OFICIAL DE MINECRAFT. NO ESTÁ APROBADO NI ASOCIADO CON MOJANG O MICROSOFT.',
          trademark: 'Minecraft es una marca comercial de Mojang Synergies AB / Microsoft Corporation.'
        },
        cookie: {
          message: '🍪 <strong>Aviso de privacidad:</strong> Este sitio puede cargar recursos y servicios de terceros. El botón solo cierra este aviso; no registra ni transmite una elección de consentimiento publicitario. Consulta la <a href="privacy.html">Política de privacidad</a> y los <a href="terms.html">Términos</a>.',
          close: 'Cerrar aviso'
        }
      }
    },
    en: {
      language: 'en',
      title: {
        guides: 'Minecraft Guides, Tutorials and Articles | Nebula',
        about: 'About Nebula Dev Studios',
        contact: 'Contact and Support | Nebula Dev Studios'
      },
      description: {
        guides: 'Practical Minecraft guides on performance, Java, mods, errors, shaders, and servers. Check versions, steps, and sources before making changes.',
        about: 'Learn about the independent Nebula Dev Studios project, its launcher, documentation, and public contact channels.',
        contact: 'Contact Nebula Dev Studios by email, Discord, or GitHub Issues with questions and reports about Nebula Launcher.'
      },
      nav: ['Home', 'Guides & Articles', 'About', 'Methodology', 'Contact', 'Download Launcher'],
      footer: {
        project: 'Independent software project and Minecraft-related documentation.',
        headings: ['Navigation', 'Resources', 'Legal'],
        home: 'Home',        guides: 'Guides and tutorials', about: 'About the project', contact: 'Contact',
      privacy: 'Privacy policy', terms: 'Terms of service', source: 'Source code on GitHub',
      performance: 'FPS troubleshooting', mods: 'Installing mods', errors: 'Troubleshooting',
        privacy: 'Privacy policy', terms: 'Terms of service', report: 'Report an issue',
        copyright: '© 2026 Nebula Dev Studios. All rights reserved.',
        disclaimer: 'NOT AN OFFICIAL MINECRAFT PRODUCT. NOT APPROVED BY OR ASSOCIATED WITH MOJANG OR MICROSOFT.',
        trademark: 'Minecraft is a trademark of Mojang Synergies AB / Microsoft Corporation.'
      },
      cookie: {
        message: '🍪 <strong>Privacy notice:</strong> This site may load third-party resources and services. This button only closes the notice; it does not record or transmit an advertising consent choice. See the <a href="privacy.html">Privacy Policy</a> and <a href="terms.html">Terms</a>.',
        close: 'Close notice'
      },
      about: {
        hero: ['✦ Mission and philosophy', 'About Nebula Dev Studios', 'Nebula Launcher is an independent project related to Minecraft. This site shares information about the software, its guides, contact options, and links to project resources.'],
        stats: [['Guides', 'Minecraft documentation'], ['2024', 'Project started'], ['GitHub', 'Code and projects'], ['Contact', 'Support and corrections']],
        story: ['🪐 Our story', 'began as an independent project in 2024. Its main activity is developing Nebula Launcher and publishing documentation and guides related to Minecraft and its tools.', 'Nebula Launcher is built with Electron, TypeScript, and Node.js. Its visual options may change between versions; check the release and notes for supported formats and settings.', 'The launcher includes tools for managing Minecraft profiles and accessing mod resources. Available features depend on the installed version; check release notes and linked repositories for the current scope.'],
        values: ['✨ Our principles', 'As we develop software and publish documentation, we aim to make the project clear, useful, and transparent about its scope and limitations.', ['Performance', 'We review resource use and interface responsiveness during development; performance may vary by system and settings.'], ['Privacy and transparency', 'We explain data handling and web technologies in our <a href="./privacy.html">Privacy Policy</a>. External services may collect data depending on their settings and your consent preferences.'], ['Design and aesthetics', 'We believe technical tools should be easy to use. We design a cosmic-inspired interface with clear typography and subtle interactions.']],
        ecosystem: ['🤝 Commitment to the open ecosystem', 'The Minecraft ecosystem includes independent loaders and catalogs. Profile compatibility depends on the file, game version, loader, and dependencies specified by their authors; check these details before installing.', 'The project’s public code and reports are available on <a href="https://github.com/fonduev/astral-nebula-launcher" target="_blank" rel="noopener">GitHub</a>. Check the repository for current activity, licensing, and contribution options.'],
        contact: ['📬 Contact and transparency', 'For questions or suggestions about the project, email <a href="mailto:soporte@nebuladevstudios.com" style="color:var(--accent-cyan);font-weight:600;">soporte@nebuladevstudios.com</a> or use the channels listed in our <a href="./contact.html" style="color:var(--accent-purple);font-weight:600;text-decoration:underline;">Contact Center</a>.']
      },
      contact: {
        hero: ['✦ Support center', 'Contact and support for Nebula Launcher', 'For questions, suggestions, or reports, use one of the available channels. Response times depend on the team and community’s availability.'],
        channels: [['Discord community', 'Check for updates or ask the community for guidance. Replies depend on the people participating in the server.', 'Join Discord →'], ['Email', 'For business inquiries, security reports, institutional collaborations, and direct support.', 'soporte@nebuladevstudios.com →'], ['GitHub Issues', 'Report technical issues, include relevant logs, or request features in the project repository.', 'View repository →']],
        form: ['Send us a message', 'Complete the form to open your default email app, where you can review and send the message. This site does not send it.', ['Name or nickname *', 'Your name or Minecraft nickname'], ['Email address *', 'you@example.com'], 'Reason for contacting us *', 'Choose an option…', ['Technical support / launch issue', 'Bug report', 'Feature suggestion', 'Collaboration / server / creator', 'Other'], 'Message *', 'Describe your question or issue. If relevant, include your Minecraft version and operating system.', 'Open email to send message'],
        faq: ['Frequently asked questions', ['Does Nebula Launcher support Microsoft accounts?', 'Check the documentation for your release to see available account options and the permissions requested by its authentication flow.'], ['What should I do if Minecraft will not start or shows “Exit Code 1”?', 'Exit Code 1 is a generic result. Check the log, Java, loader, and mods; our <a href="./guias/exit-code-1-minecraft-solucion.html">troubleshooting guide</a> explains where to start.'], ['Where can I find the code and releases?', 'Check the project’s <a href="https://github.com/fonduev/astral-nebula-launcher" target="_blank" rel="noopener">GitHub repository</a> and releases. Public source code is not a substitute for an independent security audit; verify the origin of files you download.'], ['How do I install CurseForge or Modrinth modpacks?', 'The interface and import options may vary by version. Before installing, check the modpack, loader, Minecraft version, and dependencies; consult the release notes if you are unsure.']]
      },
      guides: {
        hero: ['✦ Minecraft guides and resources', 'Minecraft guides and tutorials', 'Practical Minecraft guides on performance, mods, Java, errors, and servers. Check the versions and sources listed before making changes.'],
        filters: ['✦ All articles', '⚡ Performance and FPS', '🛠️ Support and logs', '☕ Java and JVM', '📦 Mods and NeoForge', '🎨 Shaders', '🌐 Servers'],
        cards: [
          ['⚡ Performance and FPS', 'How to diagnose and improve Minecraft performance', 'Review what each mod optimizes, confirm compatible versions and loaders, and test changes one at a time to identify conflicts.'],
          ['⚡ Performance and FPS', 'Fabric performance mods: what each category optimizes', 'Compare rendering, logic, and memory optimizations; check dependencies and compatibility, and add mods one at a time.'],
          ['⚡ RAM', 'How much RAM to allocate to Minecraft: adjust the heap with evidence', 'Learn to adjust the heap based on actual use, distinguish memory pressure from other issues, and change settings step by step.'],
          ['⚡ 4 GB PC settings', 'Minecraft on a 4 GB PC: limits and settings', 'Recognize the memory limits of a low-memory PC and prioritize settings that do not exhaust Windows resources.'],
          ['⚡ HDD performance', 'Minecraft on an HDD: diagnose pauses and test safe settings', 'Diagnose HDD loading pauses, check free space and disk activity, and test safe changes before touching world files.'],
          ['⚡ Mod comparison', 'Sodium vs OptiFine: differences, compatibility, and how to choose', 'Compare features and version compatibility, then follow a controlled test to choose a profile for your mods and system.'],
          ['⚡ Graphics settings', 'Render distance and simulation distance: what changes', 'Understand which chunks are displayed and which remain active; adjust both distances with a controlled test in your world.'],
          ['🛠️ Exit Code 1', 'Exit Code 1 in Minecraft: a troubleshooting guide', 'Check the launcher message, log, and Java, loader, and mod versions before trying a reversible change.'],
          ['🔍 Log troubleshooting', 'How to read latest.log and crash reports', 'Use latest.log and a crash report, if available, as clues; compare stack traces with versions and dependencies before assigning a cause.'],
          ['🛠️ Troubleshooting', 'Common Minecraft errors: where to start diagnosing', 'Use error messages and logs to check the heap, runtime, mod dependencies, and graphics issues before changing files.'],
          ['🛠️ OpenGL error', 'White screen and OpenGL 65542/65543 errors in Minecraft', 'Check the full message, driver, and selected GPU. An OpenGL error does not prove Java is the cause or that driver files should be replaced.'],
          ['🛠️ Memory usage', 'Minecraft mod memory use: diagnose with Spark', 'Distinguish heap limits, system memory, and possible leaks; collect a log and repeatable test before changing the JVM.'],
          ['🔍 Lag diagnosis', 'FPS, TPS, and MSPT: what to measure', 'Distinguish low FPS from slow ticks and use the right measurement to locate a bottleneck on the client or server.'],
          ['☕ Java runtime', 'Minecraft Java versions: Java 8, 17, and 21', 'Check which runtime your profile needs and how to identify the Java version selected by your launcher.'],
          ['☕ Java compatibility', 'Java 8, 17, and 21: requirements and compatibility', 'Check published game, loader, and mod requirements when you encounter a class compatibility error.'],
          ['⚙️ JVM flags', 'Minecraft JVM arguments: what to check and what to avoid', 'Understand the heap, check JVM option compatibility, and compare a change only when you have a reason and can repeat the test.'],
          ['☕ ZGC vs G1GC', 'ZGC or G1GC in Minecraft: differences and how to compare them', 'Compare G1GC and ZGC, review what changes by Java version, and measure a configuration without assuming one recipe fits everyone.'],
          ['📦 Mods and loaders', 'How to install and manage mods in Fabric, Forge, and NeoForge', 'Check each file’s game version, loader, and dependencies; install profiles without mixing settings or worlds.'],
          ['📦 NeoForge vs Fabric', 'NeoForge vs Fabric: choosing for modpacks and shaders', 'Compare mod availability and versions; check the loader and Minecraft version on each project’s page before choosing.'],
          ['📁 Separate profiles', 'How to create separate Minecraft instances and isolate mods', 'Separate mods, settings, and worlds by profile to test different loaders and make changes easier to undo.'],
          ['🎨 Shaders and graphics', 'How to choose Minecraft shaders: style, settings, and compatibility', 'Compare visual styles and controls, check compatibility, and test packs with the same settings; FPS gains are not universal.'],
          ['🎨 Integrated GPU', 'How to choose shaders for Minecraft on integrated graphics', 'Check the GPU model, compatible versions, and pack settings; compare results on your own system with a repeatable test.'],
          ['🎨 OptiFine alternatives', 'OptiFine in Minecraft: when to use it and which alternatives to consider', 'Compare OptiFine, Sodium, and Iris, check version compatibility, and switch profiles while preserving your worlds.'],
          ['🌐 Paper/Purpur servers', 'How to create a Minecraft server with Paper or Purpur', 'Prepare the installation, accept the EULA, start the server, and plan remote access without exposing unnecessary services.'],
          ['🌐 Server performance', 'How to diagnose and tune a Paper server', 'Measure TPS and tick duration with spark, locate the source of load, and test reversible settings using Paper documentation.']
        ],
        readMore: 'Read the full guide →',
        footer: {
          project: 'Independent project publishing Minecraft-related guides and documentation.',
          headings: ['Navigation', 'Resources', 'Legal'],
          home: 'Home', guides: 'Guides and tutorials', about: 'About the project', contact: 'Contact',
          performance: 'FPS troubleshooting', mods: 'Installing mods', errors: 'Troubleshooting', source: 'Source code on GitHub',
          privacy: 'Privacy policy', terms: 'Terms of service', copyright: '© 2026 Nebula Dev Studios. All rights reserved.',
          disclaimer: 'NOT AN OFFICIAL MINECRAFT PRODUCT. NOT APPROVED BY OR ASSOCIATED WITH MOJANG OR MICROSOFT.',
          trademark: 'Minecraft is a trademark of Mojang Synergies AB / Microsoft Corporation.'
        },
        cookie: {
          message: '🍪 <strong>Privacy notice:</strong> This site may load third-party resources and services. This button only closes the notice; it does not record or transmit an advertising consent choice. See the <a href="privacy.html">Privacy Policy</a> and <a href="terms.html">Terms</a>.',
          close: 'Close notice'
        }
      }
    },
    pt: {
      language: 'pt-BR',
        title: {
          guides: 'Guias, tutoriais e artigos de Minecraft | Nebula',
          about: 'Sobre a Nebula Dev Studios',
          contact: 'Contato e suporte | Nebula Dev Studios'
        },
        description: {
          guides: 'Guias práticos de Minecraft sobre desempenho, Java, mods, erros, shaders e servidores. Confira versões, etapas e fontes antes de fazer alterações.',
          about: 'Conheça o projeto independente Nebula Dev Studios, seu launcher, documentação e canais públicos de contato.',
          contact: 'Entre em contato com a Nebula Dev Studios por e-mail, Discord ou GitHub Issues para dúvidas e relatos sobre o Nebula Launcher.'
        },
        nav: ['Início', 'Guias e artigos', 'Sobre', 'Metodologia', 'Contato', 'Baixar launcher'],
        footer: {
          project: 'Projeto independente de software e documentação relacionada ao Minecraft.',
          headings: ['Navegação', 'Recursos', 'Legal'],
          home: 'Início',        guides: 'Guias e tutoriais', about: 'Sobre o projeto', contact: 'Contato',
      privacy: 'Política de privacidade', terms: 'Termos de serviço', source: 'Código no GitHub',
      performance: 'Diagnóstico de FPS', mods: 'Instalação de mods', errors: 'Solução de erros',
          privacy: 'Política de privacidade', terms: 'Termos de serviço', report: 'Relatar um problema',
          copyright: '© 2026 Nebula Dev Studios. Todos os direitos reservados.',
        disclaimer: 'ESTE NÃO É UM PRODUTO OFICIAL DO MINECRAFT. NÃO É APROVADO NEM ASSOCIADO À MOJANG OU À MICROSOFT.',
        trademark: 'Minecraft é uma marca comercial da Mojang Synergies AB / Microsoft Corporation.'
        },
        cookie: {
          message: '🍪 <strong>Aviso de privacidade:</strong> Este site pode carregar recursos e serviços de terceiros. Este botão apenas fecha o aviso; não registra nem transmite uma escolha de consentimento para publicidade. Consulte a <a href="privacy.html">Política de privacidade</a> e os <a href="terms.html">Termos</a>.',
          close: 'Fechar aviso'
        },
        about: {
          hero: ['✦ Missão e filosofia', 'Sobre a Nebula Dev Studios', 'O Nebula Launcher é um projeto independente relacionado ao Minecraft. Neste site compartilhamos informações sobre o software, seus guias, formas de contato e links para os recursos do projeto.'],
          stats: [['Guias', 'Documentação de Minecraft'], ['2024', 'Início do projeto'], ['GitHub', 'Código e projetos'], ['Contato', 'Suporte e correções']],
          story: ['🪐 Nossa história', 'começou como um projeto independente em 2024. Sua principal atividade é desenvolver o Nebula Launcher e publicar documentação e guias relacionados ao Minecraft e suas ferramentas.', 'O Nebula Launcher é desenvolvido com Electron, TypeScript e Node.js. As opções visuais podem mudar entre versões; consulte a release e suas notas para conhecer os formatos e configurações disponíveis.', 'O launcher reúne ferramentas para gerenciar perfis de Minecraft e acessar recursos de mods. Os recursos disponíveis dependem da versão instalada; consulte as notas de lançamento e os repositórios vinculados para confirmar o escopo atual.'],
          values: ['✨ Nossos princípios', 'Ao desenvolver software e publicar documentação, buscamos manter o projeto claro, útil e transparente quanto ao seu escopo e às suas limitações.', ['Desempenho', 'Durante o desenvolvimento, revisamos o uso de recursos e a resposta da interface; o desempenho pode variar conforme o equipamento e as configurações.'], ['Privacidade e transparência', 'Explicamos o tratamento de dados e o uso de tecnologias web em nossa <a href="./privacy.html">Política de privacidade</a>. Serviços externos podem coletar dados conforme suas configurações e suas preferências de consentimento.'], ['Design e estética', 'Acreditamos que ferramentas técnicas devem ser fáceis de usar. Criamos uma interface com estética cósmica, tipografia clara e interações sutis.']],
          ecosystem: ['🤝 Compromisso com o ecossistema aberto', 'O ecossistema do Minecraft inclui loaders e catálogos independentes. A compatibilidade de cada perfil depende do arquivo, da versão do jogo, do loader e das dependências indicadas pelos autores; confira esses dados antes de instalar.', 'O código e os relatos públicos do projeto podem ser consultados no <a href="https://github.com/fonduev/astral-nebula-launcher" target="_blank" rel="noopener">GitHub</a>. Consulte o repositório para verificar a atividade, a licença e as opções de contribuição atuais.'],
          contact: ['📬 Contato e transparência', 'Para dúvidas ou sugestões sobre o projeto, escreva para <a href="mailto:soporte@nebuladevstudios.com" style="color:var(--accent-cyan);font-weight:600;">soporte@nebuladevstudios.com</a> ou use os canais listados em nossa <a href="./contact.html" style="color:var(--accent-purple);font-weight:600;text-decoration:underline;">Central de contato</a>.']
        },
        contact: {
          hero: ['✦ Central de suporte e ajuda', 'Contato e suporte do Nebula Launcher', 'Para dúvidas, sugestões ou relatos, use um dos canais disponíveis. O tempo de resposta depende da disponibilidade da equipe e da comunidade.'],
          channels: [['Comunidade no Discord', 'Consulte novidades ou peça orientação à comunidade. As respostas dependem das pessoas que participam do servidor.', 'Entrar no Discord →'], ['E-mail', 'Para dúvidas comerciais, relatos de segurança, colaborações institucionais e suporte direto.', 'soporte@nebuladevstudios.com →'], ['GitHub Issues', 'Relate problemas técnicos, inclua logs relevantes ou solicite recursos no repositório do projeto.', 'Ver repositório →']],
          form: ['Envie uma mensagem', 'Preencha a mensagem para abrir seu aplicativo de e-mail padrão, onde poderá revisá-la e enviá-la. Este site não envia a mensagem.', ['Nome ou apelido *', 'Seu nome ou apelido no Minecraft'], ['Endereço de e-mail *', 'voce@exemplo.com'], 'Motivo do contato *', 'Selecione uma opção…', ['Suporte técnico / problema ao iniciar', 'Relato de erro', 'Sugestão de recurso', 'Colaboração / servidor / criador de conteúdo', 'Outro motivo'], 'Mensagem *', 'Descreva sua dúvida ou problema. Se for relevante, inclua a versão do Minecraft e o sistema operacional.', 'Abrir e-mail para enviar a mensagem'],
          faq: ['Perguntas frequentes', ['O Nebula Launcher é compatível com contas Microsoft?', 'Consulte a documentação da release que você está usando para conferir as opções de conta e as permissões solicitadas pelo fluxo de autenticação.'], ['O que devo fazer se o Minecraft não iniciar ou mostrar “Exit Code 1”?', 'Exit Code 1 é um resultado genérico. Confira o log, o Java, o loader e os mods; nosso <a href="./guias/exit-code-1-minecraft-solucion.html">guia de diagnóstico</a> explica por onde começar.'], ['Onde posso consultar o código e as versões?', 'Consulte o <a href="https://github.com/fonduev/astral-nebula-launcher" target="_blank" rel="noopener">repositório do GitHub</a> e suas releases. A publicação do código não substitui uma auditoria de segurança independente; verifique a origem dos arquivos baixados.'], ['Como instalo modpacks do CurseForge ou Modrinth?', 'A interface e as opções de importação podem variar conforme a versão. Antes de instalar, confira o modpack, o loader, a versão do Minecraft e as dependências; consulte as notas da release se tiver dúvidas.']]
        },
        guides: {
          hero: ['✦ Guias e recursos de Minecraft', 'Guias e tutoriais para Minecraft', 'Guias práticos de Minecraft sobre desempenho, mods, Java, erros e servidores. Confira as versões e fontes indicadas antes de fazer alterações.'],
          filters: ['✦ Todos os artigos', '⚡ Desempenho e FPS', '🛠️ Suporte e logs', '☕ Java e JVM', '📦 Mods e NeoForge', '🎨 Shaders', '🌐 Servidores'],
          cards: [
            ['⚡ Desempenho e FPS', 'Como diagnosticar e melhorar o desempenho do Minecraft', 'Confira o que cada mod otimiza, confirme as versões e loaders compatíveis e teste as alterações uma de cada vez para identificar conflitos.'],
            ['⚡ Desempenho e FPS', 'Mods de desempenho para Fabric: o que cada categoria otimiza', 'Compare otimizações de renderização, lógica e memória; confira dependências e compatibilidade e adicione mods um de cada vez.'],
            ['⚡ Memória RAM', 'Quanta RAM alocar ao Minecraft: ajuste o heap com base no uso', 'Aprenda a ajustar o heap conforme o uso real, diferenciar pressão de memória de outros problemas e alterar as configurações passo a passo.'],
            ['⚡ Ajustes para 4 GB', 'Minecraft em um PC com 4 GB de RAM: limites e ajustes', 'Reconheça os limites de memória de um PC modesto e priorize configurações que não esgotem os recursos do Windows.'],
            ['⚡ Desempenho em HDD', 'Minecraft em HDD: diagnóstico de pausas e ajustes seguros', 'Investigue pausas de carregamento em HDD, confira o espaço livre e a atividade do disco e teste alterações seguras antes de mexer nos arquivos do mundo.'],
            ['⚡ Comparação de mods', 'Sodium vs OptiFine: diferenças, compatibilidade e como escolher', 'Compare recursos e compatibilidade por versão e faça um teste controlado para escolher o perfil adequado aos seus mods e equipamento.'],
            ['⚡ Configurações gráficas', 'Distância de renderização e simulação: o que muda', 'Entenda quais chunks são exibidos e quais continuam ativos; ajuste ambas as distâncias com um teste controlado no seu mundo.'],
            ['🛠️ Exit Code 1', 'Exit Code 1 no Minecraft: guia de diagnóstico', 'Confira a mensagem do launcher, o log e as versões de Java, loader e mods antes de testar uma alteração reversível.'],
            ['🔍 Diagnóstico de logs', 'Como ler latest.log e crash reports', 'Use latest.log e o crash report, se houver, como pistas; compare stack traces com versões e dependências antes de atribuir uma causa.'],
            ['🛠️ Solução de problemas', 'Erros comuns do Minecraft: por onde começar o diagnóstico', 'Use mensagens de erro e logs para conferir heap, runtime, dependências de mods e problemas gráficos antes de alterar arquivos.'],
            ['🛠️ Erro OpenGL', 'Tela branca e erros OpenGL 65542/65543 no Minecraft', 'Confira a mensagem completa, o driver e a GPU selecionada. Um erro OpenGL não prova que o Java seja a causa nem que arquivos do driver devam ser substituídos.'],
            ['🛠️ Uso de memória', 'Uso de memória no Minecraft com mods: diagnóstico com Spark', 'Diferencie limites do heap, memória do sistema e possíveis vazamentos; reúna um log e um teste reproduzível antes de alterar a JVM.'],
            ['🔍 Diagnóstico de lag', 'FPS, TPS e MSPT: o que medir', 'Diferencie FPS baixos de ticks lentos e use a medição apropriada para localizar um gargalo no cliente ou no servidor.'],
            ['☕ Runtime Java', 'Versões Java para Minecraft: Java 8, 17 e 21', 'Confira qual runtime seu perfil precisa e como identificar a versão de Java escolhida pelo launcher.'],
            ['☕ Compatibilidade Java', 'Java 8, 17 e 21: requisitos e compatibilidade', 'Confira os requisitos publicados do jogo, loader e mods ao encontrar um erro de compatibilidade de classes.'],
            ['⚙️ Flags JVM', 'Argumentos JVM para Minecraft: o que conferir e evitar', 'Entenda o heap, confira a compatibilidade das opções JVM e compare uma alteração somente se houver motivo e for possível repetir o teste.'],
            ['☕ ZGC vs G1GC', 'ZGC ou G1GC no Minecraft: diferenças e como comparar', 'Compare G1GC e ZGC, confira o que muda por versão do Java e meça uma configuração sem presumir que uma receita serve para todos.'],
            ['📦 Mods e loaders', 'Como instalar e gerenciar mods no Fabric, Forge e NeoForge', 'Confira a versão do jogo, o loader e as dependências de cada arquivo; instale perfis sem misturar configurações ou mundos.'],
            ['📦 NeoForge vs Fabric', 'NeoForge vs Fabric: como escolher para modpacks e shaders', 'Compare a disponibilidade de mods e versões; confira o loader e a versão do Minecraft na página de cada projeto antes de escolher.'],
            ['📁 Perfis separados', 'Como criar instâncias separadas no Minecraft e isolar mods', 'Separe mods, configurações e mundos por perfil para testar loaders diferentes e facilitar a reversão de alterações.'],
            ['🎨 Shaders e gráficos', 'Como escolher shaders para Minecraft: estilo, opções e compatibilidade', 'Compare estilos e controles visuais, confira a compatibilidade e teste os packs com as mesmas configurações; ganhos de FPS não são universais.'],
            ['🎨 GPU integrada', 'Como escolher shaders para Minecraft em uma GPU integrada', 'Confira o modelo da GPU, as versões compatíveis e as configurações do pack; compare resultados no seu equipamento com um teste reproduzível.'],
            ['🎨 Alternativas ao OptiFine', 'OptiFine no Minecraft: quando usar e quais alternativas considerar', 'Compare OptiFine, Sodium e Iris, confira a compatibilidade por versão e troque de perfil preservando seus mundos.'],
            ['🌐 Servidores Paper/Purpur', 'Como criar um servidor Minecraft com Paper ou Purpur', 'Prepare a instalação, aceite o EULA, inicie o servidor e planeje o acesso remoto sem expor serviços desnecessários.'],
            ['🌐 Desempenho do servidor', 'Como diagnosticar e ajustar um servidor Paper', 'Meça TPS e duração dos ticks com spark, localize a origem da carga e teste ajustes reversíveis usando a documentação do Paper.']
          ],
          readMore: 'Ler o guia completo →',
          footer: {
            project: 'Projeto independente com guias e documentação relacionada ao Minecraft.',
            headings: ['Navegação', 'Recursos', 'Legal'],
            home: 'Início', guides: 'Guias e tutoriais', about: 'Sobre o projeto', contact: 'Contato',
            performance: 'Diagnóstico de FPS', mods: 'Instalação de mods', errors: 'Solução de erros', source: 'Código no GitHub',
            privacy: 'Política de privacidade', terms: 'Termos de serviço', copyright: '© 2026 Nebula Dev Studios. Todos os direitos reservados.',
            disclaimer: 'ESTE NÃO É UM PRODUTO OFICIAL DO MINECRAFT. NÃO É APROVADO NEM ASSOCIADO À MOJANG OU À MICROSOFT.',
            trademark: 'Minecraft é uma marca comercial da Mojang Synergies AB / Microsoft Corporation.'
          },
          cookie: {
            message: '🍪 <strong>Aviso de privacidade:</strong> Este site pode carregar recursos e serviços de terceiros. Este botão apenas fecha o aviso; não registra nem transmite uma escolha de consentimento para publicidade. Consulte a <a href="privacy.html">Política de privacidade</a> e os <a href="terms.html">Termos</a>.',
            close: 'Fechar aviso'
          }
        }
    }
  };

  const page = location.pathname.endsWith('guias.html') ? 'guides' :
    location.pathname.endsWith('about.html') ? 'about' :
    location.pathname.endsWith('contact.html') ? 'contact' : null;
  if (!page) return;

  const langNames = { es: 'Español', en: 'English', pt: 'Português' };
  const navHrefs = {
    './index.html': 0,
    './guias.html': 1,
    './about.html': 2,
    './metodologia.html': 3,
    './contact.html': 4
  };
  const footerNames = {
    './index.html': 'home', './guias.html': 'guides', './about.html': 'about',
    './contact.html': 'contact', './privacy.html': 'privacy', './terms.html': 'terms',
    './guias/optimizar-minecraft-pc-bajos-recursos.html': 'performance',
    './guias/como-instalar-modpacks-mods-minecraft.html': 'mods',
    './guias/solucion-errores-comunes-minecraft.html': 'errors',
    'https://github.com/fonduev/astral-nebula-launcher': 'source'
  };
  const footerLabels = {
    es: { report: 'Reportar un problema' },
    en: { report: 'Report an issue' },
    pt: { report: 'Relatar um problema' }
  };

  function setText(element, text, html) {
    if (!element || text === undefined) return;
    if (html) element.innerHTML = text;
    else element.textContent = text;
  }

  function translateNavigation(copy, lang) {
    document.querySelectorAll('nav .nav-links a').forEach((anchor) => {
      const href = anchor.getAttribute('href');
      const index = navHrefs[href];
      if (index !== undefined && copy.nav[index] !== undefined) setText(anchor, copy.nav[index]);
    });
    const download = document.querySelector('nav .nav-btn');
    if (download) setText(download, copy.nav[5]);
    document.querySelectorAll('.page-language').forEach((group) => {
      group.setAttribute('aria-label', lang === 'es' ? 'Idioma' : lang === 'en' ? 'Language' : 'Idioma');
      group.querySelectorAll('button').forEach((button) => {
        const buttonLang = button.getAttribute('onclick').match(/'([a-z]{2})'/)[1];
        button.classList.toggle('active', buttonLang === lang);
        button.setAttribute('aria-pressed', String(buttonLang === lang));
        button.setAttribute('aria-label', langNames[buttonLang]);
        button.style.color = buttonLang === lang ? 'var(--text-main)' : 'var(--text-muted)';
      });
    });
  }

  function translateFooter(copy) {
    const footer = document.querySelector('footer');
    if (!footer) return;
    const columns = footer.querySelectorAll('.footer-col');
    if (columns[0]) setText(columns[0].querySelector('p'), copy.project);
    const headings = copy.headings;      columns.forEach((column, index) => {
      const heading = column.querySelector('h4');
      if (index > 0 && headings[index - 1]) setText(heading, headings[index - 1]);
      column.querySelectorAll('a').forEach((anchor, linkIndex) => {
        const href = anchor.getAttribute('href');
        const label = index === 3 && linkIndex === 2
          ? footerLabels[document.documentElement.lang.startsWith('pt') ? 'pt' : document.documentElement.lang]['report']
          : copy[footerNames[href]] || (href.includes('github.com/') ? copy.source : null);
        if (label) setText(anchor, label);
      });
    });
    const bottom = footer.querySelector('.footer-bottom');
    if (bottom) {
      const children = bottom.children;
      setText(children[0], copy.copyright);
      const notice = children[1];
      if (notice) {
        const strong = notice.querySelector('strong');
        if (strong) setText(strong, copy.disclaimer);
        const nodes = Array.from(notice.childNodes).filter((node) => node.nodeType === Node.TEXT_NODE && node.textContent.trim());
        if (nodes.length > 1) nodes[0].textContent = '';
        const textNodes = Array.from(notice.childNodes).filter((node) => node.nodeType === Node.TEXT_NODE);
        const trademarkNode = textNodes[textNodes.length - 1];
        if (trademarkNode) trademarkNode.textContent = '\n        ' + copy.trademark + '\n      ';
      }
    }
  }

  function translateCookie(copy) {
    const banner = document.getElementById('cookieConsentBanner');
    if (!banner) return;
    setText(banner.querySelector('.cookie-content p'), copy.message, true);
    setText(banner.querySelector('.btn-cookie-accept'), copy.close);
  }

  function translateAbout(copy) {
    const hero = document.querySelector('.hero-about');
    if (hero) {
      setText(hero.querySelector('.badge'), copy.hero[0]);
      setText(hero.querySelector('h1'), copy.hero[1]);
      setText(hero.querySelector('.hero-sub'), copy.hero[2]);
    }
    document.querySelectorAll('.stats-banner > div').forEach((stat, index) => {
      if (!copy.stats[index]) return;
      setText(stat.querySelector('.stat-num'), copy.stats[index][0]);
      setText(stat.querySelector('.stat-label'), copy.stats[index][1]);
    });
    const sections = document.querySelectorAll('.container > .glass-card');
    if (sections[0]) {
      setText(sections[0].querySelector('h2'), copy.story[0]);
      sections[0].querySelectorAll('p').forEach((paragraph, index) => setText(paragraph, copy.story[index + 1]));
    }
    if (sections[1]) {
      setText(sections[1].querySelector('h2'), copy.values[0]);
      setText(sections[1].querySelector(':scope > p'), copy.values[1]);
      sections[1].querySelectorAll('.value-card').forEach((card, index) => {
        const value = copy.values[index + 2];
        if (!value) return;
        setText(card.querySelector('h3'), value[0]);
        setText(card.querySelector('p'), value[1], true);
      });
    }
    if (sections[2]) {
      setText(sections[2].querySelector('h2'), copy.ecosystem[0]);
      sections[2].querySelectorAll('p').forEach((paragraph, index) => setText(paragraph, copy.ecosystem[index + 1], index === 1));
    }
    if (sections[3]) {
      setText(sections[3].querySelector('h2'), copy.contact[0]);
      setText(sections[3].querySelector('p'), copy.contact[1], true);
    }
  }

  function translateContact(copy) {
    const hero = document.querySelector('.hero-contact');
    if (hero) {
      setText(hero.querySelector('.badge'), copy.hero[0]);
      setText(hero.querySelector('h1'), copy.hero[1]);
      setText(hero.querySelector('.hero-sub'), copy.hero[2]);
    }
    document.querySelectorAll('.channels-grid .channel-card').forEach((card, index) => {
      const channel = copy.channels[index];
      if (!channel) return;
      setText(card.querySelector('h3'), channel[0]);
      setText(card.querySelector('p'), channel[1]);
      setText(card.querySelector('.channel-link-text'), channel[2]);
    });
    const form = document.querySelector('.form-wrapper');
    if (form) {
      const content = copy.form;
      setText(form.querySelector('h2'), content[0]);
      setText(form.querySelector(':scope > p'), content[1]);
      setText(form.querySelector('label[for="name"]'), content[2][0]);
      document.getElementById('name')?.setAttribute('placeholder', content[2][1]);
      setText(form.querySelector('label[for="email"]'), content[3][0]);
      document.getElementById('email')?.setAttribute('placeholder', content[3][1]);
      setText(form.querySelector('label[for="subject"]'), content[4]);
      const options = form.querySelectorAll('#subject option');
      if (options[0]) setText(options[0], content[5]);
      options.forEach((option, index) => { if (index > 0 && content[6][index - 1]) setText(option, content[6][index - 1]); });
      setText(form.querySelector('label[for="message"]'), content[7]);
      document.getElementById('message')?.setAttribute('placeholder', content[8]);
      setText(form.querySelector('button[type="submit"]'), content[9]);
    }
    const faq = document.querySelector('.faq-section');
    if (faq) {
      setText(faq.querySelector('h2'), copy.faq[0]);
      faq.querySelectorAll('.faq-item').forEach((item, index) => {
        const entry = copy.faq[index + 1];
        if (!entry) return;
        setText(item.querySelector('.faq-question'), entry[0]);
        setText(item.querySelector('.faq-answer'), entry[1], true);
      });
    }
  }

  function translateGuides(copy) {
    const hero = document.querySelector('.hero-guides');
    if (hero) {
      setText(hero.querySelector('.badge'), copy.hero[0]);
      setText(hero.querySelector('h1'), copy.hero[1]);
      setText(hero.querySelector('.hero-sub'), copy.hero[2]);
    }
    document.querySelectorAll('.filter-container .filter-btn').forEach((button, index) => setText(button, copy.filters[index]));
    document.querySelectorAll('.guides-grid .guide-card').forEach((card, index) => {
      const entry = copy.cards[index];
      if (!entry) return;
      setText(card.querySelector('.cat-tag'), entry[0]);
      setText(card.querySelector('h3'), entry[1]);
      setText(card.querySelector('p'), entry[2]);
      setText(card.querySelector('.read-more'), copy.readMore);
    });
    const footerCopy = { ...copy.footer, cookie: copy.cookie };
    translateFooter(footerCopy);
    translateCookie(copy.cookie);
  }

  window.setWebLanguage = function setWebLanguage(language) {
    const lang = translations[language] ? language : 'es';
    const copy = translations[lang];
    const content = copy[page];
    localStorage.setItem('nebula_web_lang', lang);
    document.documentElement.lang = copy.language;
    const locale = document.querySelector('meta[property="og:locale"]');
    if (locale) locale.setAttribute('content', lang === 'es' ? 'es_ES' : lang === 'pt' ? 'pt_BR' : 'en_US');
    document.title = copy.title[page];
    const description = document.querySelector('meta[name="description"]');
    if (description) description.setAttribute('content', copy.description[page]);
    ['og:title', 'twitter:title'].forEach((selector) => {
      const meta = document.querySelector(`meta[property="${selector}"]`) || document.querySelector(`meta[name="${selector}"]`);
      if (meta) meta.setAttribute('content', copy.title[page]);
    });
    ['og:description', 'twitter:description'].forEach((selector) => {
      const meta = document.querySelector(`meta[property="${selector}"]`) || document.querySelector(`meta[name="${selector}"]`);
      if (meta) meta.setAttribute('content', copy.description[page]);
    });      translateNavigation(copy, lang);
    if (page === 'about') translateAbout(content);
    if (page === 'contact') translateContact(content);
    if (page === 'guides') translateGuides(content);
    if (page !== 'guides') {
      translateFooter(copy.footer);
      translateCookie(copy.cookie);
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    const saved = localStorage.getItem('nebula_web_lang');
    const browserLang = (navigator.language || '').toLowerCase();
    const initial = saved && translations[saved] ? saved : browserLang.startsWith('es') ? 'es' : browserLang.startsWith('pt') ? 'pt' : 'en';
    window.setWebLanguage(initial);
  });
})();
