import folium
from folium import plugins
from shapely.geometry import Polygon
import json

def create_interactive_map():
    # Define cities
    cities = {
        'Sanandaj': (47.0059, 35.3219),
        'Erbil': (44.0088, 36.1911),
        'Mahabad': (45.7222, 36.7682),
        'Sulaymaniyah': (45.4329, 35.5556)
    }
    
    # Calculate center point
    center_lat = sum(coord[1] for coord in cities.values()) / len(cities)
    center_lon = sum(coord[0] for coord in cities.values()) / len(cities)
    
    # Create base map
    m = folium.Map(location=[center_lat, center_lon], 
                   zoom_start=7,
                   tiles='cartodbpositron')
    
    # Add drawing tools
    draw = plugins.Draw(
        export=True,
        position='topleft',
        draw_options={
            'polyline': False,
            'rectangle': False,
            'circle': False,
            'circlemarker': False,
            'marker': False,
            'polygon': True
        }
    )
    m.add_child(draw)
    
    # Add cities as markers
    for city, coords in cities.items():
        folium.Marker(
            location=[coords[1], coords[0]],
            popup=city,
            icon=folium.Icon(color='red', icon='info-sign')
        ).add_to(m)
    
    # Example predefined regions (you can modify these coordinates)
    regions = {
        'Western Region': [
            [36.5, 43.8], [36.7, 44.3],  
            [36.2, 44.4], [35.9, 44.2],
            [35.8, 43.7], [36.1, 43.6]
        ],
        'Central Region': [
            [36.9, 45.2], [37.1, 45.8],
            [36.6, 46.0], [36.3, 45.9],
            [36.2, 45.4], [36.5, 45.1]
        ],
        'Eastern Region': [
            [35.6, 46.7], [35.9, 47.2],
            [35.4, 47.3], [35.1, 47.1],
            [35.0, 46.8], [35.3, 46.6]
        ]
    }
    
    # Add predefined regions with different styles
    for i, (name, coords) in enumerate(regions.items()):
        color = ['#FF6B6B', '#4ECDC4', '#45B7D1'][i]  # Different color for each region
        
        folium.Polygon(
            locations=coords,
            popup=name,
            color=color,
            weight=3,  # Border width
            fill=True,
            fill_color=color,
            fill_opacity=0.2,
            dash_array='5, 10',  # Creates dashed border
            tooltip=f"Click to edit {name}"
        ).add_to(m)
    
    # Add a measure control for distance measurements
    plugins.MeasureControl(position='bottomleft').add_to(m)
    
    return m

# Create and save the map
map_obj = create_interactive_map()
map_obj.save('/Users/sina/Desktop/kurdistan_regions.html')

# Function to extract coordinates from drawn polygons
def get_polygon_coords(geojson_str):
    """Convert GeoJSON to coordinate list"""
    geojson = json.loads(geojson_str)
    if geojson['type'] == 'Feature':
        coords = geojson['geometry']['coordinates'][0]
        return [[lat, lon] for lon, lat in coords]
    return None

    