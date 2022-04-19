from itertools import count
from urllib import response
from flask import Flask, render_template, jsonify, request
import numpy as np
import pandas as pd
import math
import json
# import re
from flask_cors import CORS


app = Flask(__name__)
app.config['JSON_SORT_KEYS']=False

CORS(app)

# @app.route('/')
# def hello():
#     return render_template('index.html')

class Type:
        def __init__(self, name, children):
                self.name = name
                self.children = children

        # def toJSON(self):
        #         j = json.dumps(self, default=lambda o: o.__dict__)
        #         re.sub(r'(?<!: )"(\S*?)"', '\\1', j)
        #         print(j)
        #         return j

class Count:
        def __init__(self, name, count):
                self.name = name
                self.count = count

        # def toJSON(self):
        #         j = json.dumps(self, default=lambda o: o.__dict__)
        #         re.sub(r'(?<!: )"(\S*?)"', '\\1', j)
        #         print(j)
        #         return j

# def set_default(obj):
#     if isinstance(obj, set):
#         return list(obj)
#     raise TypeError


Defense = {"CB", "LB", "LCB", "LWB", "RB", "RCB", "RWB", "SUB"}
Mid_Fielder = {"CAM", "CDM", "CM", "LAM", "LCM", "LDM", "LM", "RAM", "RCM", "RDM", "RM"}
Attacker = {"CF", "LF", "LS", "LW", "RES", "RF", "RS", "RW", "ST"}

@app.route('/')
def hello():
        return render_template('index.html')

@app.route('/sunburst', methods = ['GET'])
def biplot():
        df = pd.read_csv("static/data/fifa.csv")
        pos = dict()
        col = "club_position_"
        res = dict()
        for i in range(15, 23):
                new_col = col + str(i)
                for st in df[new_col]:
                        if st is None or type(st) is not str or st in "nan":
                                continue

                        if st in pos:
                                pos[st] += 1
                        else:
                                pos.update({st:1})

        DefList = list()
        for d in Defense:
                DefList.append(Count(d, int(pos[d])))

        MidList = list()
        for m in Mid_Fielder:
                MidList.append(Count(m, int(pos[m])))

        AttList = list()
        for a in Attacker:
                AttList.append(Count(a, int(pos[a])))

        # GKList = Count("GK", int(pos["GK"]))

        PlayerList = list()
        PlayerList.append(Type("Defence", DefList))
        PlayerList.append(Type("Mid Fielder", MidList))
        PlayerList.append(Type("Attacker", AttList))
        PlayerList.append(Count("Goal Keeper", pos["GK"]))

        data = Type("Players", PlayerList)

        # res["def"] = list(Defense)
        # res["att"] = list(Attacker)
        # res["mid"] = list(Mid_Fielder)
        # res["freq"] = pos

        print(data)

        # response = jsonify({data.toJSON()})
        # data = json.loads(data)

        # return json.dumps(data, default=vars)
        response = jsonify(json.loads(json.dumps(data, default=vars)))
        response.headers.add("Access-Control-Allow-Origin", "*")
        return response

@app.route('/geo_json', methods = ['GET'])
def geomap():
        df = pd.read_csv("static/data/fifa.csv")
        return jsonify(df[["nationality", "sofifa_id"]].groupby("nationality").count().to_dict()["sofifa_id"])
        

if __name__ == '__main__':
    app.run(host='localhost', port=5005, debug=True)
