from urllib2 import urlopen
import json 
import time
import urlparse
import base64
import hmac
import hashlib
import string

API_KEY = 'AIzaSyAn610eOj44GYFWOhG5dyDgJQxVudTt2xo'
GOOGLE_API = 'http://maps.googleapis.com/maps/api/directions/json'
MATRIX_API = 'https://maps.googleapis.com/maps/api/distancematrix/json'
MODE = 'walking'

def build_url(origin, destination):
	pt1 = str(origin.lat) + ',' + str(origin.lng)
	pt2 = str(destination.lat) + ',' + str(destination.lng)
	url = '%s?origin=%s&destination=%s&sensor=false&mode=%s&units=metric' % (GOOGLE_API, pt1, pt2, MODE)
	#print url
	#return url
	return createSecureURL(url)

def combine_coordinates_urlstring(locations):
    buffer_list =[]
    for location in locations:
        buffer_list.append(str(location.lat) + ',' + str(location.lng))
    return string.join(buffer_list,'|')


def build_url_matrix(origins, destinations, mode, departure_time, units='metric', precision=5):
    #precision: number of decimal points to round origin and destination coordinates to
    origins_string = combine_coordinates_urlstring(origins)
    destinations_string = combine_coordinates_urlstring(destinations)
    url = '%s?origins=%s&destinations=%s&mode=%s&units=metric&language=en' % (MATRIX_API, origins_string, destinations_string, MODE)
    return createSecureURL(url)

def make_request(origin, destination):
	url = build_url(origin, destination)
	request = urlopen(url)
	response = json.load(request)
	return response

def make_request_matrix(origin, destination):
    url = build_url(origin, destination)
    request = urlopen(url)
    response = json.load(request)
    return response

def createSecureURL(url):
	url = url + '&client=gme-mitisandt'
	url = urlparse.urlparse(url)
	urlToSign = url.path + "?" + url.query
	privateKey = '7HyrvDsrV6trC91E-E7F6xpjWjs='
	decodedKey = base64.urlsafe_b64decode(privateKey)
	signature = hmac.new(decodedKey, urlToSign, hashlib.sha1)
	encodedSignature = base64.urlsafe_b64encode(signature.digest())
	originalUrl = url.scheme + '://' + url.netloc + url.path + "?" + url.query
	fullURL = originalUrl + "&signature=" + encodedSignature
	return fullURL

class Point():
	def __init__(self, lng, lat):
		self.lat = lat
		self.lng = lng

destination = Point(-71.081940,42.368304)
origin = Point(-71.094655, 42.367438)
response = make_request(origin,destination)
distance = response['routes'][0]['legs'][0]['distance']['value']
print distance
print response.keys()
#print response["routes"]
for r in response["routes"]:
    print r.keys()
    print
print response['routes'][0]['legs'][0]['duration']


