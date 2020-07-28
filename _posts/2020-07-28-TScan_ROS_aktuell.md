# TScan Data in ROS aktueller Zustand

Soweit ich es überblicken kann ist die Implementierung in ROS nicht abgeschlossen, jedoch sollte dies keine größere Hürde mehr darstellen.
Auffällig war in der Vergangenheit, dass nicht alle Punktwolken es über das Netzwerk tatsächlich vom Auswerte Computer (Tracker-Laptop) zum ROS-Laptop geschafft haben,
hier bestand dann einfach die Möglichkeit (jedenfalls im Bezug zu meiner Forschungsarbeit) mehrfach zu scannen, kleine Lücken sind da nicht so das Problem.

Es hat sich aber auch gezeigt, dass ein flächendeckend Daten ankommen, die ganze Problematik muss also noch weiter untersucht werden, ist aber nicht Prio A.

Daten erhält man aktuell so:
TScan anschließen und wie gewohnt mit dem Terminalfenster (COM3) geöffnet einschalten, danach (mit passendem Dongle) T-Scan Collect öffnen und auf die beiden 
grünen Punkte achten.

`Tracker Latop` auf dem Desktop den Release Ordner öffnen und dort die TScanClient.exe vom 15.12.2019 öffnen. Die TScan kann (muss aber nicht) schon im Scope des 
Lasertrackers sein (locked, followed) - wenn sie es nicht ist, dann jetzt das Tracking so herstellen. Dann in dem gestarteten Programm Connect Scanner drücken, im 
Log Fenster sollte eine 0 auftauchen, die den Erfolg anzeigt. Dann alle 5 Buttons bei SetScannerUpdateHandler, Set3D... drücken (im Fenster wird deren aktivieren angezeigt).
Jetzt weiter rechts, weiter unten auf den Button "Socket - (StartPolyline) drücken,StartPolyline ist ein relikt und wird nicht durchgeführt, stattdessen habe ich in
diesen Knopf Frankensteinartig den Socketaufbau eingebaut (also in der passen .sln die direkt in meinem Home Ordner liegt für das TScan Programm). Jetzt
wartet das Programm darauf, dass sich ein weiter Client mit im Verbindet, in unserem Fall der ROS-Computer.
Auf dem ROS Rechner jetzt mit dem dazu gehörenden ROS-Package (siehe Gitlab emScon) die Verbindung über den Befehl 
```bash
$ rosrun igros_emscon igros_emscon_tscan >> tscan_pw.txt
```
aufbauen.

Der Verbindungsaufbau wird auf dem tracker-Laptop im Log angezeigt, auch der gewählte Port wird da gezeigt und welche IP.
Jetzt sind die beiden Systeme über den Port miteinander verbunden. Alles ist sehr sperrig und führt nur bei genauer befolgung der Anweisung zum Erfolg,
aber dies ist ja auch nur eine Momentaufnahme (ich glaube ich hab das damals ziemlich hingehackt). Jetzt zum Tracker-Laptop und dort im Programm noch nacheinander
"Start Scanner" (T-Scan macht piep) und "StartScannerMeasurement" drücken. 

Jetzt werden die Scanlinedaten direkt über den Socket geschossen und auf dem ROS-Auswertelaptop in die Datei tscan_pw.txt gestreamt (wegen der >>).
Wenn man sich die angucken will kann man auch vom Befehl den Stream weglassen, dann gehen die Daten aber aktuell noch nirgendwo hin.

---

Zum Beenden Strg+C beim ROS-Rechner drücken (Stream wird quasi nur abgebrochen)..
Und beim Tracker-laptop auf "StopScannerMeasurement" und "StopAcquisitionMode" (es macht pieipiep) und dann auf "close" drücken. Fertig

Die Punktwolke tscan_pw.txt liegt jetzt mit Ascii X,Y,Z vor und kann in CloudCompare betrachtet werden (oder so).


---

Es bleibt also einiges zu entwickeln, Liste folgt dann zb Hier.
Aber so funktioniert das erstmal und das erste ist, dass ich gucken muss ob was im aktuelle "Release" Ordner ist, auch das ist was in der .sln grade angeboten wird.
