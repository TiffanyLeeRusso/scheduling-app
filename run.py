from flask import Flask, render_template, request
from flask_mysqldb import MySQL
from flask_cors import CORS, cross_origin
import json

app = Flask(__name__, static_url_path='', template_folder='public')

# MySQL setups
app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = 'admin'
app.config['MYSQL_DB'] = 'schedule'

# PROD_REMOVE CORS stuff below
app.config['CORS_HEADERS'] = 'Content-Type'
cors = CORS(app)

mysql = MySQL(app)

@app.route('/')
def index():
    return render_template('index.html')

def get_table(table):
  cursor = mysql.connection.cursor()
  cursor.execute(
      ''' SELECT * FROM %s ''' % table)
  mysql.connection.commit()
  data = cursor.fetchall()
  row_headers=[x[0] for x in cursor.description] # extract row headers
  cursor.close()
  json_data=[]
  for result in data:
    json_data.append(dict(zip(row_headers,result)))
  return json_data

@app.route('/users', methods=['GET'])
@cross_origin() # PROD_REMOVE this line
def get_users():
    if request.method == 'GET':
      try:
        json_data = get_table("users")
        return { 'status': '200', 'data': json.dumps(json_data) }
      except Exception as e:
        print("get_users error: %s", str(e))
    return { 'status': '500' }

@app.route('/clients', methods=['GET'])
@cross_origin() # PROD_REMOVE this line
def get_clients():
    if request.method == 'GET':
      try:
        json_data = get_table("clients")
        return { 'status': '200', 'data': json.dumps(json_data) }
      except Exception as e:
        print("get_clients error: %s", str(e))
    return { 'status': '500' }

@app.route('/services', methods=['GET'])
@cross_origin() # PROD_REMOVE this line
def get_services():
    if request.method == 'GET':
      try:
        json_data = get_table("services")
        return { 'status': '200', 'data': json_data }
      except Exception as e:
        print("get_services error: %s", str(e))
    return { 'status': '500' }

@app.route('/appointment_services', methods=['GET'])
@cross_origin() # PROD_REMOVE this line
def get_appointment_services():
    if request.method == 'GET':
        try:
          json_data = get_table("appointment_services")
          return { 'status': '200', 'data': json.dumps(json_data) }
        except Exception as e:
          print("get_appointment_services error")
    return { 'status': '500' }

@app.route('/appointments', methods=['GET'])
@cross_origin() # PROD_REMOVE this line
def get_appointments():
    if request.method == 'GET':
        try:
          json_data = get_table("appointments")
          return { 'status': '200', 'data': json_data }
        except Exception as e:
          print("get_appointments error: %s", str(e))
    return { 'status': '500' }

@app.route('/appointments', methods=['POST'])
@cross_origin() # PROD_REMOVE this line
def add_appointment():
    if request.method == 'POST':
        try:
          data = request.get_json()
          services = data["services"]
          del data["services"]

          attrs = []
          values = []
          for (attribute, value) in data.items():
            attrs.append(attribute)
            values.append("\"" + value + "\"")
          attrs = ', '.join(attrs)
          values = ', '.join(values)

          # insert the row into the appointments table
          cursor = mysql.connection.cursor()
          cursor.execute(
            ''' 
INSERT INTO appointments (%s) VALUES (%s); ''' % (attrs, values))

          # insert the services into the appointment_services table
          appointment_id = cursor.lastrowid
          for service_id in services:
            cursor.execute(
            ''' INSERT INTO appointment_services (appointment_id, service_id) VALUES (%s, %s); ''' % (appointment_id, service_id))

          mysql.connection.commit()
          return { 'status': '200' }
        except Exception as e:
          print("add_appointment error: %s", str(e))
    return { 'status': '500' }

@app.route('/appointments', methods=['PUT'])
@cross_origin() # PROD_REMOVE this line
def update_appointment():
    if request.method == 'PUT':
        try:
          data = request.get_json()

          services = data["services"]
          del data["services"]

          appointment_id = data["appointment_id"]
          del data["appointment_id"]

          colVals = []
          for (attribute, value) in data.items():
            colVals.append(attribute + "=" + "\"" + str(value) + "\"")
          colVals = ', '.join(colVals)

          cursor = mysql.connection.cursor()

          # update the row in the appointments table
          cursor.execute(
            ''' 
UPDATE appointments SET %s WHERE id=%s; ''' % (colVals, appointment_id))

          # update the services in the appointment_services table
          # by deleting all the services for this appointment and re-adding them
          cursor.execute(
            ''' 
DELETE FROM appointment_services WHERE appointment_id=(%s); ''' % appointment_id)

          for service_id in services:
            cursor.execute(
            ''' INSERT INTO appointment_services (appointment_id, service_id) VALUES (%s, %s); ''' % (appointment_id, service_id))
          mysql.connection.commit()
          return { 'status': '200' }
        except Exception as e:
          print("update_appointment error: %s", str(e))
    return { 'status': '500' }
    
@app.route('/appointments', methods=['DELETE'])
@cross_origin() # PROD_REMOVE this line
def delete_appointment():
    if request.method == 'DELETE':
      try:
          data = request.get_json()
          cursor = mysql.connection.cursor()
          cursor.execute(
            ''' 
DELETE FROM appointment_services WHERE appointment_id=%s; ''' % data["appointment_id"])
          cursor.execute(
            ''' 
DELETE FROM appointments WHERE id=%s; ''' % data["appointment_id"])
          
          mysql.connection.commit()
          return { 'status': '200' }
      except Exception as e:
        print("delete_appointment error: %s", str(e))
    return { 'status': '500' }

# Running app
if __name__ == '__main__':
    app.run(debug=True, host='localhost', port=5000)
