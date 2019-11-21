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

T-Scan Spezifikation
Anschluss der T-Scan (an den Computer)
Scannercontroller starten
Befehlsliste Scannercontroller
Known-Problems
Ansätze

## Aufnahme Roboterarm Verfahrweg

Sicherheitswarnung
UR5 Spezifikation
Inbetriebnahme
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

``bash
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



