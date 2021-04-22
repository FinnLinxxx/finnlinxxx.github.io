# Prinzip:



* Als Referenzmesssystem wird ein Lasertracker (LT) eingesetzt. Derzeit ein [LTD800](https://w3.leica-geosystems.com/media/new/product_solution/Ref64_LTD700_800_Data_sheet.pdf). Datenblätter liegen auf dem Netzlaufwerk (S:).
* Dem gegenüber steht das zu untersuchende System, dies sind zunächst terrestrische Laserscanner (TLS).  
Erfolgreich getestet wurden: Leica MS50, Leica MS60. Datenblätter zum Gerät und Geocom liegen auf dem Netzlaufwerk (S:).
* Alle entgültigen Punktwolken liegen im [.pcd](https://pointclouds.org/documentation/tutorials/pcd_file_format.html#)-Format vor (ROS/[PCL_ROS](http://wiki.ros.org/pcl_ros))
* Berechnungen sind in mm durchzufuehren, Ergebnisse in m. Alle Rotationsangaben sind in Radiant zu machen (rad).
* Es wird ausschließlich mit mathematischen/rechtshändrischen Koordinatensystemen gearbeitet.
* Liegen Daten nicht im mathematischen Koordinatensystemen vor sind diese zu überführen, bei der Umwandlung geodätischer Systeme werden vorzugsweise die Werte der X-Achse \*-1 genommen. 
* Die hier beschriebenen Beispieldatensätze beziehen sich auf den Aufbau TLS auf Messpfeiler 9 im Labor GH. Die 0 Orientierung liegt in Richtung der Messpfeiler auf der 
