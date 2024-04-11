# UV Map erzeugen aus Objektdateien
(*.obj, *.ifc, *.fbx und alle weiteren Formate die in Blender unterstützt werden)


### Umwandlung in .obj format
(Auch mit Hilfe des BlenderBIM AddOn)

### Merge zu einem Objekt
A->Strg+j (eventuell aufteilend zusammenfassen)

### UV Map erzeugen
(in den edit Modus wechseln (Objekt muss ausgewählt sein)).
Mit der Maus im rechten Fenster u drücken und dann "smart UV Project"
Auf der linken UV Seite "+ new" (Das Bild zb. "A" nennen 1024x1024 pixel)

### Shading
In den Shading Modus wechseln und alle Materialien in der Auflistung aufklappen. 
Jeweils auf jedes Material klicken, dann im unteren Fensterbereich (Shader Editor) die Maus hinführen und 
Shift+A->Textures->Image Texture hinzufügen, **A** als Ziel auswählen

### Sonne/Licht hinzufügen
Add->Light->sun (Ort und Richtung setzen)
Sonnen Objekt auswählen (in der Liste)
-> Object Data Properties, Strengh: 10 (oder so)

### Rendern
In die Render Properties wechseln und Cycles Enginge auswählen.
-> Objekt muss ausgewählt sein
-> Bake (combined, alles auswählen oder diffus, nur color auswählen)
