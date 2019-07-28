import json

def planetList(jsonData):
    ret = """ <h1 class="planety">Planety:</h1> \n <ul class="lista1"> """
    for i in jsonData["planets"]:
        ret += """
        		<li> <a class="link" href="#planeta{0}">{0}</a> {1} x {2} </li>
                """.format(i, jsonData["planets"][i]["x"], jsonData["planets"][i]["y"])
    ret += """\n </ul>"""
    return ret

def spaceshipList(jsonData):
    ret = """ <h1 class="statki">Statki:</h1> \n <ul class="lista2"> """
    for i in jsonData["starships"]:
        position = jsonData["starships"][i]["position"]
        ret += """
        		<li> <a href="#statek{0}"> {0} </a> {1} x {2} [{3}] </li>
        		""".format(i, jsonData["planets"][position]["x"], jsonData["planets"][position]["y"], position)
    ret += """\n </ul>"""
    return ret

def planetItems(jsonData, planet):
    ret = """
    		<table>
                <caption> Towary </caption>
                <tr>
                    <th> Nazwa </th>
                    <th> Liczba </th>
                    <th> Cena kupna </th>
                    <th> Cena sprzedarzy </th>
                </tr> 
            """
    for i in jsonData["planets"][planet]["available_items"]:
        ret += """ <tr>
                        <td>{0}</td>
                        <td>{1}</td>
                        <td>{2}</td>
                        <td>{3}</td>
                    </tr>
				""".format(i, jsonData["planets"][planet]["available_items"][i]["available"],
              				  jsonData["planets"][planet]["available_items"][i]["buy_price"],
              				  jsonData["planets"][planet]["available_items"][i]["sell_price"])
    ret += """</table>"""
    return ret

def spaceshipsOnPlanet(jsonData, planet):
    ret = """<p class="popstatki">Statki:</p> \n <ul class="lista4">\n"""
    for i in jsonData["starships"]:
        if jsonData["starships"][i]["position"] == planet:
        	ret += """<li> <a href="#statek{0}"> {0} </a> </li>""".format(i)
    ret += """</ul>"""
    return ret

def planets(jsonData):
    ret = ""
    for i in jsonData["planets"]:
        ret += """
        <div id="planeta{0}" class="overlay">
    		<div class="popup">
        		<p> Planeta: {0} </p>
        		{1}
        		{2}
        		<a class="close" href="#">&times;</a>
        	</div>
		</div>
""".format(i, planetItems(jsonData, i), spaceshipsOnPlanet(jsonData, i))
    return ret


def bazar(jsonData, planet):
    ret = """<table>
                <caption> Targowisko </caption>
                <tr>
                    <th> Nazwa </th>
                    <th> Dostępne </th>
                    <th> Cena kupna </th>
                    <th> Cena sprzedarzy </th>
                    <th></th>
                    <th></th>
                </tr>
		  """
    for i in jsonData["planets"][planet]["available_items"]:
        ret += """
        			<tr>
                        <td>{0}</td>
                        <td>{1}</td>
                        <td>{2}</td>
                        <td>{3}</td>
                        <td>
                        <form action="" method="GET">
                            <button type="submit"> KUP </button>
                        </form>
                    	</td>
                    	<td>
                        <form action="" method="GET">
                            <button type="submit"> Sprzedaj </button>
                        </form>
                    	</td>
                    </tr>
				""".format(i, jsonData["planets"][planet]["available_items"][i]["available"],
              				  jsonData["planets"][planet]["available_items"][i]["buy_price"],
              				  jsonData["planets"][planet]["available_items"][i]["sell_price"])
    ret += '</table>'
    return ret


def moveOptions(jsonData):
    ret = """
    			<form action="" method="GET">
                    <p> Wybierz planetę: </p>
                    <select>
		  """
    
    for i in jsonData["planets"]:
        ret += """<option>{0}</option>\n""".format(i)
    
    ret += """
    			</select>
                    <button type="submit"> Podróżuj </button>
            	</form>
            """
    return ret

def ships(jsonData):
    ret = ""
    for i in jsonData["starships"]:
        planet = jsonData["starships"][i]["position"]
        ret += """
        	<div id="statek{0}" class="overlay">
    			<div class="popup2">
        			<h1> Statek: {0} </h1>
        			<p> Położenie: {1} x {2} <br> [{3}] </p>
                	{4}
                	{5}
        			<a class="close" href="#">&times;</a>
    			</div>
			</div>
			""".format(i, jsonData["planets"][planet]["x"], jsonData["planets"][planet]["y"], planet, bazar(jsonData, planet), moveOptions(jsonData))
    return ret

def code(login, jsonData):
    ret = """<!DOCTYPE html>
<html lang="pl">

<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>GRA</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" type="text/css" media="screen" href="ekran_gry.css">
    <script src="main.js"></script>
</head>

<body>
	<div class="container">
        <p class="nick">Mój Nick: {0} </p>
        <p class="konto">Stan konta: {1} </p>
        <p class="czas">Pozostały czas: {2} </p>

        {3}
        
        {4}

    </div>
{5}

{6}

</body>

</html>
""".format(login, jsonData["initial_credits"], jsonData["game_duration"],
           planetList(jsonData),spaceshipList(jsonData), planets(jsonData), ships(jsonData))
    return ret


if __name__ == "__main__":
    with open("/home/golkarolka/Desktop/www/initial_data.json", 'r') as f:
        jsonData = json.load(f)
    if jsonData:
        with open("ekran_startowy.html", "w") as file:
            file.write(code("ufo1403", jsonData))


