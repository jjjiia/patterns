import os
import json
import csv
from math import radians, cos, sin, asin, sqrt

def haversine(lon1, lat1, lon2, lat2):
    """
    Calculate the great circle distance between two points 
    on the earth (specified in decimal degrees)
    """
    # convert decimal degrees to radians 
    lon1, lat1, lon2, lat2 = map(radians, [lon1, lat1, lon2, lat2])
    # haversine formula 
    dlon = lon2 - lon1 
    dlat = lat2 - lat1 
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * asin(sqrt(a)) 
    mile = 3959 * c
    return mile

#make a file of each code
#for each zone, make a list of years
locations = "data_tobeprocessed/locationsForSchools.csv"
trees = "data_tobeprocessed/trees.geojson"
def readLocations(csvfile):
    locations = []
    with open(csvfile, 'r') as f:
        data = csv.reader(f)
        next(data, None)
        for place in data:
            name = place[0]
            lat = place[2]
            lng = place[3]
            locations.append([name,lat,lng])
    print "locations:", len(locations)
    return locations
#openspaces = "data_tobeprocessed/openspaces.geojson"
#busstops = "data_tobeprocessed/busstops.geojson"
#busRoutes = "data_tobeprocessed/busRoutes.geojson"
#bikeRoutes = "data_tobeprocessed/bikeShare_top200.json"
#buildings = "data_tobeprocessed/building_basemap.geojson"
#competition = "data_tobeprocessed/competition.geojson"
businesses = "data_tobeprocessed/cambridge_businesses.json"
def readGeoFeatures(file,idColumn):
    features = []
    with open(file, 'r') as b:
        fid = 0
        geodata = json.load(b)
        for s in geodata["features"]:
            feature={}
            feature["coordinates"] = s["geometry"]["coordinates"]
            #feature["coordinates"] = [s["lat"],s["lng"]]
            feature["type"] = s["type"][0]
            if idColumn == "undefined":
                feature["pid"] = fid
            else:   
                #feature["pid"] = s["properties"][idColumn]
                feature["pid"] = s[idColumn]
            features.append(feature)
            fid +=1
    print "features:", len(features)
    return features

def readBikeShare(file,idColumn):
    features = []
    with open(file, 'r') as b:
        fid = 0
        geodata = json.load(b)
        for s in geodata:
            print s["features"][0]["properties"]["id"]
            feature={}
            feature["coordinates"] = s["features"][0]["geometry"]["coordinates"]
            if idColumn == "undefined":
                feature["pid"] = fid
            else:   
                feature["pid"] = s["features"][0]["properties"][idColumn]
            features.append(feature)
            fid +=1
    print "features:", len(features)
    return features

def readGeoFeaturesBuildings(file,idColumn,properties):
    features = []
    with open(file, 'r') as b:
        geodata = json.load(b)
        for s in geodata["features"]:
            feature={}
            feature["coordinates"] = s["geometry"]["coordinates"][0]
            feature["pid"] = s["properties"][idColumn]
            if properties!= "none":
                feature["properties"]={}
                feature["properties"][properties]=s["properties"][properties]
            
            features.append(feature)
    print len(features)
    return features



#print geoFeatures
#buildingsConverted = readGeoFeaturesBuildings(buildings,"BldgID","TOP_GL")

def matchDistances(locations,geofeatures,maxDistance,outfile):    
    outData = {}
    
    for location in locations:
        print location
        lat1 = float(location[1])
        lng1 = float(location[2])
        name = location[0]
        for g in geofeatures:
            pid = g["pid"]
            if pid not in outData.keys():
                outData[pid] = {}
                outData[pid]["ids"]=[]
                outData[pid]["coordinates"]=g["coordinates"]
               # outData[pid]["properties"]=g["properties"]
            for coordinate in g["coordinates"]:
                lat2 = coordinate[1]
                lng2 = coordinate[0]
                if isinstance(lat2, list)==False:
                    distance = haversine(lng1,lat1,lng2,lat2)
                    print distance
                    if(distance<=maxDistance):
                        outData[pid]["ids"].append([name,distance])
                        break
                    break

    placesWithSchools = {}
    for places in outData:
        if len(outData[places]["ids"])!=0:
            placesWithSchools[places]=outData[places]

    print placesWithSchools


    with open(outfile,"w") as outjson:
        json.dump(placesWithSchools,outjson)

def matchDistancesPoint(locations,geofeatures,maxDistance,outfile):    
    outData = {}
    
    for location in locations:
        print location
        lat1 = float(location[1])
        lng1 = float(location[2])
        name = location[0]
        for g in geofeatures:
            pid = g["pid"]
            if pid not in outData.keys():
                outData[pid] = {}
                outData[pid]["ids"]=[]
                outData[pid]["coordinates"]=g["coordinates"]
                outData[pid]["type"]=g["type"]
               # outData[pid]["properties"]=g["properties"]
            coordinate = g["coordinates"]
            lat2 = float(coordinate[1])
            lng2 = float(coordinate[0])
            if isinstance(lat2, list)==False:
                distance = haversine(lng1,lat1,lng2,lat2)
                #print distance
                if(distance<=maxDistance):
                    outData[pid]["ids"].append([name,distance])

    placesWithSchools = {}
    for places in outData:
        if len(outData[places]["ids"])!=0:
            placesWithSchools[places]=outData[places]

    print placesWithSchools


    with open(outfile,"w") as outjson:
        json.dump(placesWithSchools,outjson)
path = "../../patterns/data/"

locations = readLocations(locations)
geoFeatures = readGeoFeatures(trees,"undefined")
matchDistancesPoint(locations,geoFeatures,.5,path+"trees.json")
##matchDistances(locations,buildingsConverted,.25,path+"test.json")