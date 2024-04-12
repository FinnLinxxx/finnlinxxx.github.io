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
output_image_name = "myUVFile.png"

# Import .obj
bpy.ops.import_scene.obj(filepath=model_path)


# Alle Mesh-Objekte auswählen und zusammenführen
bpy.ops.object.select_all(action='DESELECT')
bpy.ops.object.select_by_type(type='MESH')
bpy.context.view_layer.objects.active = bpy.context.selected_objects[0]
bpy.ops.object.join()

# Erstellt ein neues Bild für die UV Map
image_name = "myUV"
bpy.ops.image.new(name=image_name, width=1024, height=1024, color=(0, 0, 0, 1))
image = bpy.data.images[image_name]
image.file_format = 'PNG'
image.filepath_raw = os.path.join(output_path, output_image_name)

# Wählt das aktive Objekt
obj = bpy.context.active_object

# Stellen Sie sicher, dass das Objekt im Edit-Modus ist und eine UV-Map hat
bpy.ops.object.mode_set(mode='EDIT')
bpy.ops.mesh.select_all(action='SELECT')
bpy.ops.uv.smart_project()
bpy.ops.object.mode_set(mode='OBJECT')

# Alle Materialien durchgehen und das Bild zuweisen
obj = bpy.context.object
for mat_slot in obj.material_slots:
    mat = mat_slot.material
    if mat.use_nodes:
        bsdf = mat.node_tree.nodes.get('Principled BSDF')
        if bsdf:
            tex_image = mat.node_tree.nodes.new('ShaderNodeTexImage')
            tex_image.image = image
            #mat.node_tree.links.new(bsdf.inputs['Base Color'], tex_image.outputs['Color'])
            
# Sonne hinzufügen
bpy.ops.object.light_add(type='SUN', align='WORLD', location=(0, 0, 10))
sun = bpy.context.object
sun.data.energy = 10

# Rendereinstellungen für das Baking
bpy.context.scene.render.engine = 'CYCLES'
bpy.context.scene.cycles.device = 'CPU'

# Vorbereiten zum Bake
bpy.ops.object.select_all(action='DESELECT')
obj.select_set(True)
bpy.context.view_layer.objects.active = obj

# Bake durchführen
bpy.ops.object.bake('INVOKE_DEFAULT', type='DIFFUSE', pass_filter={'COLOR'})

# UV Map als Bild speichern
image.filepath_raw = os.path.join(output_path, output_image_name)
image.file_format = 'PNG'
image.save()

print("Baking completed and UV Map saved as", output_image_name)
