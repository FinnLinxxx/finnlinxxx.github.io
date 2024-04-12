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

### Abspeichern der UV Map





### Code

import bpy
import os

# Remove any existing cameras or lights
for obj in bpy.data.objects:
    if obj.type in {'CAMERA', 'LIGHT'} or obj.name.startswith("Cube"):
        bpy.data.objects.remove(obj, do_unlink=True)
        
        
# Pfad zur Modelldatei und Ausgabepfad
model_path = "/home/finn/GEOAR_ObjectImport/my.obj"
output_path = "/home/finn/GEOAR_ObjectImport/output/"
output_image_name = "UVMapImage.png"

# Import .obj
bpy.ops.import_scene.obj(filepath=model_path)

# Alle Mesh-Objekte auswählen und zusammenführen
bpy.ops.object.select_all(action='DESELECT')
bpy.ops.object.select_by_type(type='MESH')
bpy.context.view_layer.objects.active = bpy.context.selected_objects[0]
bpy.ops.object.join()

# UV Map erstellen
bpy.ops.object.editmode_toggle()
bpy.ops.uv.smart_project()
bpy.ops.object.editmode_toggle()
