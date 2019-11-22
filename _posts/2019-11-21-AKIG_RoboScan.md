# AK IG

Für die LVA Ausgewählte Kapitel der Ingenieurgeodäsie (128.033) wird im Wintersemester 2019 die Entwicklung eines eigenen 3D Messsystems untersucht. Sensorik aus dem Bereich der Automation und flächenhaften Erfassung wird im geodätischen Kontext entwickelt.

Weitere Informationen sind dem Beschreibungstext in [TISS](https://tiss.tuwien.ac.at/course/courseAnnouncement.xhtml?dswid=8545&dsrid=730&courseNumber=128033&courseSemester=2019W) zu entnehmen:

### Merkmale
Semesterwochenstunden: 2.0
ECTS: 3.0
Typ: VU Vorlesung mit Übung
### Lernergebnisse
Nach positiver Absolvierung der Lehrveranstaltung sind Studierende in der Lage...

* den Bewegungsablauf eines Roboterarms aufgabenbezogen zu entwerfen und die Pose mittels Vorwärtskinematik zu berechnen.
mit einem Lasertracker eigenständig hochgenaue Daten für die weitere Verarbeitung zu bestimmen.
Möglichkeiten zur Ansteuerung geodätischer Messtechnik und Roboter auch aus dem Bereich open-source zu benennen und zu beurteilen.
* Ideen zur Verknüpfung von Daten mit eigenen Prozessanweisungen zu formulieren und umzusetzen.
* eigenes Wissen durch selbständiges Arbeiten auf Problemstellungen modernster Ansätze zu übertragen.
* räumliche Daten der Industriemesstechnik als Messergebnis auf eine Fragestellung hin zu analysieren und zu präsentieren.

### Inhalt der Lehrveranstaltung
Vorstellung und Diskussion von Methoden und Sensoren für die raumkontinuierliche geometrische Bestimmung. Für die Bestimmung der Geometrie kommen terrestrische Laserscanner und Methoden der Industrievermessung (LaserTracker+T_Scan) zum Einsatz. Gruppen erarbeiten und präsentieren einzelne Arbeitspakete die zusammenhängend als übergeordnete Aufgabe die Erzeugung qulitativ hochwertiger Punktwolken haben. Anhand dieser Punktwolken können systematische Einflüsse der Messmethodik aufgedeckt werden. Die Programmierkenntnisse der Studierenden werden in den Übungen gefördert und die Umsetzung der einzelnen Aufgaben unterstützt. Die Studierenden gewinnen ein Einblick darüber was in der Verbindung von Programmierung und Geodäsie möglich ist.

### Methoden
Einführung in die proprietäre Software RoboDK (Roboterarm) und Spatial Analyzer (Lasertracker). Begleitetes Tutorial für die Anwendung des (open-source) Robot Operating Systems (ROS). Unterstützung bei der Programmierung in Python/Matlab zur Umsetzung möglicher Ideen und Ansätze.

### Prüfungsmodus
Prüfungsimmanent

Kombination von Vorlesungs-, Übungs- und Diskussionseinheiten inklusive selbständiger Umsetzung von Konzeptideen (Laserscanner, Lasertracker+T-Scan, MatLab/Python).

### Vortragende
[Neuner, Hans-Berndt](https://tiss.tuwien.ac.at/adressbuch/adressbuch/person/277368)

[Linzer, Finn](https://tiss.tuwien.ac.at/adressbuch/adressbuch/person/323432)

E120 Department für Geodäsie und Geoinformation

---

### RoboScan

RoboScan ist ein neu zu entwickelndes System bei dem die T-Scan nicht im Tracker-Zusammenhang arbeitet, sondern ihre Pose über einen Roboterarm (UR5) bezieht. 

Zur Verfügung stehen ein:

* [Linux Cheat Sheet](https://github.com/FinnLinxxx/akig/blob/master/ROS_Tutorial/LINUX_Cheat_Sheet.pdf)

* [ROS Cheat Sheet](https://github.com/FinnLinxxx/akig/blob/master/ROS_Tutorial/ROS_Cheat_Sheet.pdf)

* [GIT Cheat Sheet](https://github.com/FinnLinxxx/akig/blob/master/ROS_Tutorial/GIT_Cheat_Sheet.png)


## Aufnahme Punktwolke T-Scan

Den [T-Scan Spezifikationen](https://w3.leica-geosystems.com/downloads123/m1/metrology/t-scan/brochures/leica%20t-scan%20brochure_de.pdf) entsprechend können Punkte flächenhaft mit einer Genauigkeit besser 0,1 mm erfasst werden. Für uns wichtig ist, dass die T-Scan vom Tracker unabhängig betrieben werden kann. Der eigentliche Hersteller, der die Sensorik des Zeilenlaserscanners entwickelt, hat nennt sich Steinbichler, diese Firma wurde 2015 von ZEISS übernommen. Für den von uns gedachten Einsatz ist ebenfalls wichtig, dass das zuvor handgehaltene System am Roboterarm mit einem Schnellspanner (örtlich quasi wiederhellstellbar) befestigt werden kann. Das Datenkabel der T-Scan selbst ist nur sehr kurz, ein Verlängerungskabel erhöht die Reichweite. Auf der anderen Seite muss dieses auf der Vorderseite in den SCANNER CONTROLLER (roter Strich zu rotem Strich) gesteckt werden (Aufschrift: SCANNER). Der Probe Anschluss ist für die Kommunikation mit dem LasertrackerController gedacht, ob dieses Kabel für unseren Zweck gebraucht wird ist derzeit nicht bekannt. Auf der Rückseite des SCANNER CONTROLLERS ist das Kabel des LAN- und des Console-Anschlusses an den Betriebs-PC anzuschließen. Ob das Clock/Trigger Kabel zum LasertrackerController hin angeschlossen sein muss, ist nicht bekannt. Insgesamt ist der Aufbau bereits erfolgt (bis auf eventuell das Einstecken der T-Scan selbst), falls dies nicht der Fall ist nehmen sie bitte kontakt auf.

Eine Verknüpfung names Scanner Controller (gelbliches Laptop Symbol) liegt auf dem Desktop, dabei handelt es sich um ein Konsolenprogramm mit dem Namen Teraterm, dieses kann auch über den eigentlichen Pfad (C:\Program Files (x86)\teraterm\ und dann ttermpro.exe) gestartet werden.
Das Konsolenprogram muss gestartet werden bevor der Strom am eigentlichen SCANNER CONTROLLER auf "ein" geschaltet wird. Sollte es zu einem Fehler kommen, z.B. das COM3 nicht gefunden werden kann, empfiehlt sich ein neustart des Computers. Bei funktionierender Kommunikation werden mehrere Ausgabeparameter in der Anzeige ausgegeben, bevor nach etwa 15 Sekunden ein vorwiegend grün leuchtendes Fenster erscheint. In diesem Fenster können nun Befehle an das T-Scan System durch einfache Tastatureingabe übergeben werden. Nach dem erfolgreichen Hochstarten könnte die Befehlskette wie folgt aussehen:

Um das System bzw. die Ausgabedatei auf ASCII-Symbolik umzuschalten
```
asc
(enter)
```
Im Fenster erscheint daraufhin unter dem Punkt Storage Mode: ASCII (oder ähnlich)

Mit dem folgenden Befehl können (für etwa 30 Sekunden bzw. 15 MB) Scannerzentrische Daten aufgenommen werden.
```
smo
(enter)
```
Der folgende Befehl beendet die Aufnahme
```
smf
(enter)
```

Die Daten liegen daraufhin im Ordner: `C:\ScannerController` mit dem laufenden Namen SCAN000*.asc vor und können mit einem einfachen Textverarbeitungsprogramm eingsehen werden.

### Known-Problems/Todo
Hochladen Steinbichler PDF

### Ansätze

## Aufnahme Roboterarm Verfahrweg

`Achtung! Der Betrieb des Roboterarms setzt bestimmtes Wissen und stete Vorsicht voraus, da ansonsten Material oder Menschen zu schaden kommen könnten!`

`Der folgende Text zum Roboterarm wurde aus der Gruppenarbeit von Jansky, Mikschi, Konturek und Pitsch übernommen`

### Der Roboter UR5
Der Industrieroboter UR5 der dänischen Firma Universal Robots hat eine maximale
Traglast von 5kg. Seine Reichweite beträgt 850mm. Er hat sechs Gelenke, die sich alle um 720°
bewegen lassen: Das erste „Base“ befindet sich am Fuß des Roboters, gleich darauf folgt die
„Shoulder“. Der Elbow befindet sich in der Mitte der beiden langen Arme. Vor dem Flansch befinden
sich drei „Wrist {1,2,3}“-Gelenke, deren Nummerierung auf Seite der Basis beginnt.
>Der Roboter ist per Kabel mit seinem Steuergerät verbunden; drei weitere Kabel führen ans Stromnetz, an einen WLAN-Router im IG-Messnetz und an ein „Tablet“ zum Bedienen des Roboters. Die Notaus-Taste am Tablet muss vor einer Kollision gedrückt werden!

Sicherheitshinweise Achtung, der Roboter kann Geschwindigkeiten von bis zu 1m/s
erreichen(höhere Geschwindigkeiten wurden deaktiviert). Es ist immer genug Abstand zum Roboter
einzuhalten. Ebenfalls ist darauf zu achten, dass der Roboter weder Hindernisse (z.B. die Tischplatte)
noch sich selbst berührt. In diesem Fall bricht er sein Programm ab und ist neu zu initialisieren.
>Am Tablet wird der Roboter eingeschaltet, die Motoren und das System mit dem RoboterBedienprogramm „PolyScope“ fahren hoch. Nach einer Initialisierung sind die Roboterarme zu starten. Dabei knackt es in allem Gelenken und der Roboter bewegt sich dabei um bis zu einem Zentimeter. Erst jetzt hält der Roboter Lasten an ihrer Position. 

Roboterflansch Auf dem Flansch ist ein Schnellverschluss montiert, mittels dem verschiedene
Zielobjekte auf den Roboter montiert werden können. Mögliche Ziele sind:
>- Nest für einen Red Ring Reflector (RRR), eine Kugel mit 1,5“ Durchmesser von Leica
>- Die Leica T-Probe mit einer Spitze zum Messen von Punkten, auch schwer zugängliche an Bauteilen. Die Spitze besteht aus hartem Glas und hat ca. 6mm Durchmesser. 

Koordinatensysteme Der Roboter besitzt zwei KOS. Der Ursprung des ersten liegt genau in
der Mitte jener Fläche, auf der er montiert ist. Das hauptsächlich verwendete KOS ist das des TCP,
des Tool bzw. Center Points. Es hat seinen Ursprung in der Mitte des Flansches.
>Die Pose (bestehend aus drei Translationen und drei Rotationen) des TCP ist einstellbar. Sofern für die Messung ein Punkt mit konstanter Entfernung zum Flanschmittelpunkt verwendet wird (wie etwa die Spitze der T-Probe) sollte dieser Differenzvektor in Bezug auf die Flanschmitte eingemessen werden. 

Bei Befestigung eines Werkstückes sollte nach Möglichkeit dessen Schwerpunkt als TCP angegeben
werden, sodass das Werkstück in allen Positionen und Ausrichtungen am besten gehalten werden
kann. Das geschieht durch feines Entgegenhalten der Motoren in den Gelenken des Roboters.
Zu diesem Zweck kann im Einstellungsmenü am Tablet des Roboters eingesehen werden, wie viel
Strom (in Ampere) jedes Gelenk in Ruhe als auch während der Ausführung eines Programms gerade
benötigt. 

### Simulations- und Bediensoftware „RoboDK“

RoboDK ist ein proprietäres Computerprogramm zur Simulation von Robotern vieler verschiedener
Hersteller, unter anderem Universal Robots. Das Program ist auf den im Labor befindlichen Computern bereits vorinstalliert, sollte dies nicht der Fall sein bitte Kontakt aufnehmen. 

Vorab wurde der Roboter UR5 ins Programm geladen,
inklusive der beiden Koordinatensysteme (KOS) von Basis und Tool (bzw. Target) Center Point (TCP). 
>Verbindungsaufbau Nach derzeitigem Stand der Technik kann der UR5 bereits direkt von RoboDK aus angesteuert werden. Dafür muss eine Verbindung im LAN „IG-Messnetz“ hergestellt werden. Wie in nachfolgender Abbildung ersichtlich, ist der UR5 unter der IPAdresse 192.168.178.5 und dem Port (Roboter Anschluss) 50001 erreichbar. Mit einer pingAnweisung wird die Verbindung überprüft. 

![robodkimg](https://github.com/FinnLinxxx/akig/blob/master/manual/img/screenshot_RoboDK.png)

Programmoberfläche Im linken Balken in der Grafik sind gelistet: Basis, Roboter UR5,
anschließend alle von ihm erreichbaren Ziele (samt deren KOS) und darunter als Fahrprogramme die
Prüfmuster mit deren vorgegebenen Abfolgen der anzufahrenden Punkte. [BSc-Arbeit Jansky]

>Ein Doppelklick auf den Roboter UR5 links oben öffnet das UR5 Panel, das die ganze rechte Seite einnimmt und vielerlei Eingaben ermöglicht. Drei KOS sind hier ersichtlich, die oberen beiden wurden bisher immer auf sechsmal 0 belassen. In der untersten bunten Zeile kann der Bezug des TCP (bzw. Werkzeugrahmen) zum BasisKOS als Pose manipuliert werden. Eine Pose besteht aus 6 Parametern: 3 für die Lage (Translation in [x,y,z]) und 3 für die dortige Orientierung [Rx, Ry, Rz]. Es ist dabei auf die Einheit der Winkel zu achten (Grad oder Radiant). Ebenso kann hier die Orientierung des TCP und ein kollisionsfreier Ortswechsel (siehe später) erprobt werden. 
>Der Knopf „Get Position“ fragt RoboDK die aktuelle Position am Roboter ab und stellt sie dar. 

Erstellen von Programmen Für einen Bewegungsablauf am Roboter wird in UR5 ein Programm
geschrieben, das man auch als Endlosschleife laufen lassen kann. Beim Erstellen eines Programmes
(in der Abbildung ist Prog1 zu sehen) wird zuerst ein Bezugssystem definiert. Optional können auch
Geschwindigkeitsbeschränkungen für lineare Bewegungen oder für Rotationen festgelegt werden.

Bewegung zu einem Punkt RoboDK kennt zwei Arten für das Erreichen eines Punktes. Die
empfohlene und bisher einzige verwendete Methode ist „movej“ für „movejoints“, ihr Icon ist
erkennbar am geschwungenen Weg zwischen den Zielen. Dabei werden die Punkte durch gegebene
Gelenkstellungen beschrieben und der Weg zwischen ihnen als Differenz der Gelenkwinkel gefahren.
Die andere Funktion „move“ steht für eine Linearbewegung zum Ziel. Dabei werden die Gelenke so
bewegt, dass das Werkstück entlang einer Linie bewegt wird. Dies führt zu unterschiedlichen
Geschwindigkeiten der Gelenke im Laufe des Fahrweges. 

>Um einen Fahrweg zu programmieren, wird zuerst links in der Liste der anzufahrende Punkt ausgewählt und erst dann die Art der Bewegung dorthin eingegeben. 

Darstellung und Konfigurationen der Punkte Im UR5 Panel sind rechts unten sind die Positionen
der Gelenke zu sehen (, die auch manuell bewegt werden können). Das Menü „Andere
Konfigurationen“ zeigt meist zwischen 10 und 36 verschiedene Möglichkeiten an, in welchen Arten
der Punkt erreicht werden kann. Bei einigen Kombinationen unterscheidet sich nur ein Gelenk um
360°. Entscheidend ist hier aber, ob der Ellbogen des Roboters über oder unter dem TCP liegt und
wie die Wrists zueinanderstehen. Für einen Einzelpunkt kommen mehrere Konfigurationen in Frage,
aber je komplexer die Fahrmuster werden, desto eingeschränkter die Wahlmöglichkeit – vor allem
dann, wenn die montierte T-Probe den Sichtkontakt zum Lasertracker nicht verlieren darf. 

>Um die Gelenkstellungen von Punkten aus der Liste links zu sehen, muss auf diese Punkte ein Doppelklick erfolgen. Die Animation des Fahrweges entfällt und es wird die Situation am Ziel gezeigt (mit Gelenkstellungen wie eingegeben).
Bei einfachem Klick hingegen simuliert RoboDK lediglich das Anfahren der gewünschten Position und Orientierung, meist auf kürzestem Weg. Nicht selten kommt es dabei vor, dass „unmögliche“ Wege entstehen, die nicht gefahren werden können. Der Roboter…
>* fährt zu Positionen unterhalb der Tischplatte oder
>* bewegt seine Gelenke so, dass er sich selbst durchfahren würde.
>Werden Winkelwerte der Punkte nach Erstellen des Programms geändert, so werden sie dort nicht übernommen. Geänderte Punkte sind neu in den Programmablauf zu laden! 

Kollisions-Detektion RoboDK bietet den Vorteil, Kollisionen eines beliebigen Roboterteils mit
anderen Teilen zu detektieren. Ist diese Option eingeschaltet, so leuchtet ein grünes Häkchen vor
dem Nuklear-Symbol in der oberen Leiste. Bei einer Kollision wird die Animation des Fahrprogramms
gestoppt und beide kollidierenden Teile werden rot eingefärbt. 

>Wenn alle Fahrmuster mit ihren Targets eingestellt und ausreichend in der Simulation getestet wurden, kann mit dem echten Roboter gearbeitet werden. Nach Knopfdruck von „PTP Bewegung ausführen“ leitet RoboDK die Befehle an den UR5 weiter. 

### Inbetriebnahme
```bash
$ roscore
```

```bash
$ roslaunch igros_ur move_juri.launch joints_file:=/home/finn/workspace_ur/src/igros_ur/trajectories/tscan.txt speed_factor:=0.3
```

```bash
$ rosparam set use_sim_time 1
(warum das?)
```

```bash
$ rosrun rviz rviz
(warum das?)
```


```bash
$ rosbag play thirdBagRecordSMOequal.bag --clock --loop
```

```bash
$ rosrun tf static_transform_publisher 0 0 0 0 0 0 map base_link 300
```

```bash
$ rosrun tf static_transform_publisher 0.02 0 0.33 0.4 0 -0.78539816339 tool0 lever 300
(oder ähnlich)
```

```bash
$ 
```

```bash
$ 
```

```bash
$ 
```
RoboDK Beschreibung und Verbindung
RoboDK Pfad planen, Achtung!
Verfahrdaten auslesen und in TXT übertragen
Ansteuern des Roboarms mit Skript von Thomas, was beachten?
Leverarm anhängen (wieso geht das später nicht)
Erzeugen eines Rosbags, Umbenennen


## Reproduzieren der Daten als Rosbag

Problemstellung Benennen
Lösungsansatz vorstellen
```bash
$ vim createPtcl.py
```

T-Scan Punktwolke in Ros laden, intention

```bash
$ python createPtcl.py
```

Punktwolke an leverarm hängen (siehe py-skript)

Erzeugen einer Referenzierten Punktwolke

```bash
$ rosrun tf_points_global transform_point2pointcloud _ptcl2_global_frame:=map _ptcl2_local_frame:=lever _ptcl2_input_topic:=/tscan_cloud2 _ptcl2_output_topic:=/tscan_cloud2_global _drop_when_same_position:=false
```

Rausschreiben einer Referenzierten Punktwolke 
```bash
$ rosrun pcl_ros pointcloud_to_pcd input:=/tscan_cloud2_global
```

Zusammenfassen der pcds zu einer Ascii-Datei
Öffnen der Punktwolke mit CloudCompare

Bekannte Probleme:
Ansätze:
Interpretationsansätze PW


---

### Problembeschreibung/Aufgabenstellung

1. Leverarm

2. Zeitsynchro

3. Datenverarbeitung



