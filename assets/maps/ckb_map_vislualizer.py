import folium
import json
from typing import Dict

class KurdishDialectMap:
    def __init__(self, geojson_data: str):
        self.regions_data = json.loads(geojson_data)
        self.region_indices = {
            'Ardalanî': 1,
            'Babanî': 2,
            'Mukryanî': 3,
            'Hewlêrî': 4
        }
        self.center = [35.8, 45.5]
        
        self.cities = {
            'Sanandaj': (47.0059, 35.3219),
            'Sulaymaniyah': (45.4329, 35.5556),
            'Erbil': (44.0088, 36.1911),
            'Mahabad': (45.7222, 36.7682)
        }
        
        # Your specified positions
        self.word_label_positions = {
            'Ardalanî': (46.75, 35),
            'Babanî': (45.2, 35.28),
            'Mukryanî': (45.7, 36.4),
            'Hewlêrî': (44.1, 35.95)
        }
    
    def get_variant_shade(self, variants: dict, variant: str) -> str:
        unique_variants = list(set(variants.values()))
        unique_variants.sort()
        shade_index = unique_variants.index(variant)
        shades = [
            '#ccd9ff',  # Very light blue
            '#4a6ce3',  # Medium blue
            '#203ca9',  # Darker blue
            '#1a3399'   # Very dark blue
        ]
        return shades[shade_index % len(shades)]

    def create_variant_map(self, word_variants: Dict[str, Dict[str, str]], title: str = "Dialect Variants Map"):
        m = folium.Map(
			location=self.center,
			zoom_start=7,
			tiles='CartoDB Positron',
			width=800,              # Fixed width
			height=500,             # Match iframe height
			attr='Created by Sina Ahmadi | Base map: © OpenStreetMap contributors'
		)
        
        # Add cities
        for city_name, (lon, lat) in self.cities.items():
            # City dot
            folium.CircleMarker(
                location=[lat, lon],
                radius=3,
                color='red',
                fill=True,
                fillOpacity=0.7,
                weight=1,
            ).add_to(m)
            
            # City label - without background
            folium.Marker(
                location=[lat + 0.05, lon],
                icon=folium.DivIcon(
                    html=f'''
                    <div style="
                        font-size: 10px;
                        color: black;
                        white-space: nowrap;
                        text-align: center;
                    ">
                        {city_name}
                    </div>
                    '''
                )
            ).add_to(m)
        
        for word, variants in word_variants.items():
            fg = folium.FeatureGroup(name=f'Word: {word}')
            
            for region_name, variant in variants.items():
                if region_name in self.region_indices:
                    region_idx = self.region_indices[region_name]
                    region_geometry = self.regions_data['features'][region_idx]['geometry']
                    
                    # Add colored region
                    folium.GeoJson(
                        {
                            'type': 'Feature',
                            'geometry': region_geometry,
                            'properties': {'name': region_name}
                        },
                        style_function=lambda x, color=self.get_variant_shade(variants, variant): {
                            'fillColor': color,
                            'color': 'black',
                            'weight': 1,
                            'fillOpacity': 0.5
                        }
                    ).add_to(fg)
                    
                    # Add word label with smaller box and bold text
                    label_pos = self.word_label_positions[region_name]
                    folium.Marker(
                        location=[label_pos[1], label_pos[0]],
                        icon=folium.DivIcon(
                            html=f"""
                            <div dir="rtl" style="
                                background-color: white;
                                border: 1px solid black;
                                border-radius: 3px;
                                padding: 3px;
                                font-family: 'Noto Sans Arabic', Arial, sans-serif;
                                font-size: 14px;
                                font-weight: bold;
                                text-align: center;
                                direction: rtl;
                                unicode-bidi: bidi-override;
                                white-space: nowrap;
                            ">
                                {variant}
                            </div>
                            """,
                            icon_size=(80, 30),
                            icon_anchor=(40, 15)
                        )
                    ).add_to(fg)
            
            fg.add_to(m)
        
        return m
    
    def generate_variant_maps(self, word_variants: Dict[str, Dict[str, str]], output_dir: str = "./"):
        for word in word_variants:
            word_map = self.create_variant_map(
                {word: word_variants[word]},
                f"Variants of '{word}'"
            )
            word_map.save(f"{output_dir}/{word}_variants.html")
                               
# Example usage:
def create_example_maps():
    # Your GeoJSON data
    with open('data_Central_Kurdish.geojson', 'r', encoding='utf-8') as f:
        geojson_data = f.read()
    
    mapper = KurdishDialectMap(geojson_data)
    
    # Example word variants
    example_words = {
        'child': {
            'Ardalanî': 'مناڵ',
            'Babanî': 'مناڵ',
            'Mukryanî': 'منداڵ',
            'Hewlêrî': 'مندار'
        }
    }
    
    # Generate maps
    mapper.generate_variant_maps(example_words, "./")


create_example_maps()







datasets = {
"BQI": {
	"test": "/home/user/ahmadi/DOLMA/evaluation/datasets/BQI-test.tsv", 
	"val": "/home/user/ahmadi/DOLMA/evaluation/datasets/BQI-val.tsv"
},
"GLK:": 
	{
	"test": "/home/user/ahmadi/DOLMA/evaluation/datasets/GLK-test.tsv",
	"train": "/home/user/ahmadi/DOLMA/evaluation/datasets/GLK-train.tsv",
	"val": "/home/user/ahmadi/DOLMA/evaluation/datasets/GLK-val.tsv"
	},
"HAC": {
	"test": "/home/user/ahmadi/DOLMA/evaluation/datasets/HAC-test.tsv", 
	"train": "/home/user/ahmadi/DOLMA/evaluation/datasets/HAC-train.tsv",
	"val": "/home/user/ahmadi/DOLMA/evaluation/datasets/HAC-val.tsv"
	},
"LKI": {
	"test": "/home/user/ahmadi/DOLMA/evaluation/datasets/LKI-test.tsv",
	"train": "/home/user/ahmadi/DOLMA/evaluation/datasets/LKI-train.tsv", 
	"val": "/home/user/ahmadi/DOLMA/evaluation/datasets/LKI-val.tsv"
	},
"MZN": {
	"test": "/home/user/ahmadi/DOLMA/evaluation/datasets/MZN-test.tsv", 
	"train": "/home/user/ahmadi/DOLMA/evaluation/datasets/MZN-train.tsv", 
	"val": "/home/user/ahmadi/DOLMA/evaluation/datasets/MZN-val.tsv"
	},
"SDH": {
	"test": "/home/user/ahmadi/DOLMA/evaluation/datasets/SDH-test.tsv",
	"train": "/home/user/ahmadi/DOLMA/evaluation/datasets/SDH-train.tsv", 
	"val": "/home/user/ahmadi/DOLMA/evaluation/datasets/SDH-val.tsv"
	}
"TLY": {
	"test": "/home/user/ahmadi/DOLMA/evaluation/datasets/TLY-test.tsv",
	"val": "/home/user/ahmadi/DOLMA/evaluation/datasets/TLY-val.tsv"
	}
"ZZA": {
	"test": "/home/user/ahmadi/DOLMA/evaluation/datasets/ZZA-test.tsv"
	}
}