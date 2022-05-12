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

class WordFreq:
    def __init__(self, name, count, pos):
        self.name = name;
        self.count = count;
        self.pos = pos;


Defense = {"CB", "LB", "LWB", "RB", "RWB"}
Mid_Fielder = {"CAM", "CDM", "CM", "LM", "RM"}
Attacker = {"CF", "LW", "RW", "ST"}
GoalKeeper = {"GK"}
Others = {"SUB", "nan"}

dicti = {'2015': 'fifa15.csv', '2016': 'fifa16.csv','2017': 'fifa17.csv','2018': 'fifa18.csv', '2019': 'fifa19.csv', '2020': 'fifa20.csv','2021': 'fifa21.csv','2022': 'fifa22.csv'}

@app.route("/")
def hello():
    return render_template("index.html")

@app.route("/radar")
def radar_html():
    return render_template("radar.html")

@app.route('/get_radar_data', methods = ['POST'])
def radar():
    val = request.get_json()
    print("hello1")

    main_df = pd.read_csv("static/data/" + dicti[str(val['year'])])
    df = main_df
    print("hello2")

    if 'name' in val:
        print("hello3")
        print(val['name'])
        # y = json.loads(val['name'])
        print("hello4")
        df = df[df['short_name'] == val['name']]

    print("hello5")

    cols = ["pace", 'dribbling', 'passing', 'defending', 'movement_sprint_speed', "attacking_finishing"]
    df = df[cols]
    print("hello6")
    print(df)

    result = []
    for i, row in df.iterrows():
        for c in cols:
            result.append({"axis":c, "value":row[c]})

    print(result)

    return jsonify(result)

# @app.route('/get_radar_data', methods = ['POST', 'GET'])
# def get_radar_details():
#     year = int(request.get_json().get('year'))
#     countries = request.get_json().get('country')
#     df_query = datadf.copy()
#     df_query["Population(thousands)"] = df_query["Population(thousands)"]/ df_query["Population(thousands)"].max()
#     df_query["GDP"] = df_query["GDP"]/ df_query["GDP"].max()
#     df_query = country_filter(df_query, countries)
#     df_query = df_query[(df_query["Year"]==year)]
#     # df_query = df_query[["Population(thousands)", "% urban", "GDP", "HDI"]]
#     # scaler = MinMaxScaler()
#     # df_query = pd.DataFrame(scaler.fit_transform(df_query), columns=["Population(thousands)", "% urban", "GDP", "HDI"])
#     # df_query = df_query/ df_query.max()
#     # print(df_query)
#     result = []
#     for i, row in df_query.iterrows():
#         result.append([{"axis":"Population(thousands)", "value":row["Population(thousands)"], "ISO":row["ISO"]},
#         {"axis":"% urban", "value":row["% urban"]/100, "ISO":row["ISO"]},
#         {"axis":"GDP", "value":row["GDP"], "ISO":row["ISO"]},
#         {"axis":"HDI", "value":row["HDI"], "ISO":row["ISO"]}])
#     # print(result)
#     return jsonify(result)

@app.route("/pcp")
def hello1():
    return render_template("pcp.html")

@app.route("/radar")
def hello2():
    return render_template("radar.html")

@app.route("/fetchdata", methods=["POST"])
def alldata():
    val = request.get_json()
    main_df = pd.read_csv("static/data/" + dicti[str(val['year'])])
    df = main_df

    if 'value' in val:
        y = json.loads(val['value'])
        df = df[df['final_league'].isin(y)]

    if 'nationality' in val:
        y = json.loads(val['nationality'])
        df = df[df['nationality_name'].isin(y)]

    if 'pos' in val:
        if (val['pos'] not in "Players"):
            if (val['pos'] == "Defence"):
                df = df[df['player_position'].isin(list(Defense))]
            elif (val['pos'] == "Mid Fielder"):
                df = df[df['player_position'].isin(list(Mid_Fielder))]
            elif (val['pos'] == "Attacker"):
                df = df[df['player_position'].isin(list(Attacker))]
            elif (val['pos'] == "Goal Keeper"):
                df = df[df['player_position'].isin(["GK"])]
            elif (val['pos'] in Defense or val['pos'] in Mid_Fielder or val['pos'] in Attacker):
                df = df[df['player_position'].isin([val['pos']])]
            else:
                print("Invalid input passed")

    if 'pcpval' in val:
        y = json.loads(val['pcpval'])
        df = df[df['sofifa_id'].isin(y)]

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
    if ("GK" in pos):
        PlayerList.append(Count("Goal Keeper", pos["GK"]))
    PlayerList.append(Count("Others", Others))

    data = Type("Players", PlayerList)

    WordList = list()
    wordsdf = df[["short_name", "overall", "pos_type"]]

    for index, row in wordsdf.iterrows():
        WordList.append(WordFreq(row["short_name"], row["overall"], row["pos_type"]))

    wordcloud = json.loads(json.dumps(WordList, default=vars))
    data = json.loads(json.dumps(data, default=vars))

    sdf = df[["sofifa_id","age_cluster", "rating_cluster", "wage_cluster", "continent", 'pos_type']]
    sdf = sdf.dropna()
#     df["type"] = np.select(conditions, values)

    return jsonify({
        "sunburst": data,
        "geoData": geodata,
        "data": df.to_json(orient='records'),
        "mainData": main_df.to_json(orient='records'),
        "wordcloud": wordcloud,
        "pcpdata": sdf.to_dict("records"),
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
    sdf = df[["age_cluster", "rating_cluster", "wage_cluster", "continent"]]
#     conditions = [
#     (df["club_position_15"] in Attacker),
#     (df["club_position_15"] in Defense),
#     (df["club_position_15"] in Mid_Fielder),
#     (df["club_position_15"] in "GK")
#     ]
#     values = [0, 1, 2, 3]
    sdf = sdf.dropna()
#     df["type"] = np.select(conditions, values)
    response = jsonify({"data": sdf.to_dict("records")})
    response.headers.add("Access-Control-Allow-Origin", "*")
    return response

if __name__ == "__main__":
    app.run(host="localhost", port=5005, debug=True)
