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
app.config["JSON_SORT_KEYS"] = False

CORS(app)

class Type:
    def __init__(self, name, children):
        self.name = name
        self.children = children


class Count:
    def __init__(self, name, count):
        self.name = name
        self.count = count


Defense = {"CB", "LB", "LWB", "RB", "RWB"}
Mid_Fielder = {"CAM", "CDM", "CM", "LM", "RM"}
Attacker = {"CF", "LW", "RW", "ST"}
Others = {"SUB", "nan"}

@app.route("/")
def hello():
    return render_template("index.html")

@app.route("/pcp")
def hello1():
    return render_template("pcp.html")

@app.route("/fetchdata", methods=["POST"])
def alldata():
    df = pd.read_csv("static/data/fifa22.csv")
    
    val = request.get_json()
    
    print(val)
    
    if 'value' in val:
        df = df[df['final_league'] == val['value']]

    if 'nationality' in val:
        y = json.loads(val['nationality'])
        df = df[df['nationality_name'].isin(y)]
    
    #------------ geomap
    # geoData = jsonify(
    subdf = df[["nationality_name", "sofifa_id"]]
    geodata = subdf.groupby("nationality_name").count().to_dict()["sofifa_id"]
    # print(geodata)
    # )

    #---------- sunburst
    pos = dict()
    col = "player_position"
    res = dict()
    # for i in range(15, 23):
    new_col = col.split(",")[0]
    for st in df[new_col]:
        if st is None or type(st) is not str:
            continue
        if st in pos:
            pos[st] += 1
        else:
            pos.update({st: 1})
    print(pos)
    DefList = list()
    for d in Defense:
        if d in pos:
            DefList.append(Count(d, int(pos[d])))

    MidList = list()
    for m in Mid_Fielder:
        if m in pos:
            MidList.append(Count(m, int(pos[m])))

    AttList = list()
    for a in Attacker:
        if a in pos:
            AttList.append(Count(a, int(pos[a])))

    Others = list()
    for a in Others:
        if a in pos:
            Others.append(Count(a, int(pos[a])))

    # GKList = Count("GK", int(pos["GK"]))

    PlayerList = list()
    PlayerList.append(Type("Defence", DefList))
    PlayerList.append(Type("Mid Fielder", MidList))
    PlayerList.append(Type("Attacker", AttList))
    PlayerList.append(Count("Goal Keeper", pos["GK"]))
    PlayerList.append(Count("Others", Others))

    data = Type("Players", PlayerList)

    print(data)
    print(geodata)
    print(df)

    data = json.loads(json.dumps(data, default=vars))
    return jsonify({
        "sunburst": data,
        "geoData": geodata,
        "data": df.to_json(orient='records'),
    })

@app.route("/sunburst", methods=["GET"])
def biplot():
    df = pd.read_csv("static/data/fifa22.csv")
    pos = dict()
    col = "player_position"
    res = dict()
    # for i in range(15, 23):
    new_col = col.split(",")[0]
    for st in df[new_col]:
        if st is None or type(st) is not str:
            continue
        if st in pos:
            pos[st] += 1
        else:
            pos.update({st: 1})
    print(pos)
    DefList = list()
    for d in Defense:
        DefList.append(Count(d, int(pos[d])))

    MidList = list()
    for m in Mid_Fielder:
        MidList.append(Count(m, int(pos[m])))

    AttList = list()
    for a in Attacker:
        AttList.append(Count(a, int(pos[a])))

    Others = list()
    for a in Others:
        Others.append(Count(a, int(pos[a])))

    # GKList = Count("GK", int(pos["GK"]))

    PlayerList = list()
    PlayerList.append(Type("Defence", DefList))
    PlayerList.append(Type("Mid Fielder", MidList))
    PlayerList.append(Type("Attacker", AttList))
    PlayerList.append(Count("Goal Keeper", pos["GK"]))
    PlayerList.append(Count("Others", Others))

    data = Type("Players", PlayerList)

    response = jsonify(json.loads(json.dumps(data, default=vars)))
    response.headers.add("Access-Control-Allow-Origin", "*")
    return response


@app.route("/geo_json", methods=["GET"])
def geomap():
    df = pd.read_csv("static/data/fifa22.csv")
    return jsonify(
        df[["nationality_name", "sofifa_id"]]
        .groupby("nationality_name")
        .count()
        .to_dict()["sofifa_id"]
    )


@app.route("/pcpdata", methods=["GET"])
def pcpdata():
    #     body = request.get_json().get('value')
    df = pd.read_csv("static/data/fifa22.csv")
    df = df[["age_cluster", "rating_cluster", "wage_cluster", "continent"]]
#     conditions = [
#     (df["club_position_15"] in Attacker),
#     (df["club_position_15"] in Defense),
#     (df["club_position_15"] in Mid_Fielder),
#     (df["club_position_15"] in "GK")
#     ]
#     values = [0, 1, 2, 3]
    df = df.dropna()
#     df["type"] = np.select(conditions, values)
    response = jsonify({"data": df.to_dict("records")})
    response.headers.add("Access-Control-Allow-Origin", "*")
    return response

if __name__ == "__main__":
    app.run(host="localhost", port=5005, debug=True)
