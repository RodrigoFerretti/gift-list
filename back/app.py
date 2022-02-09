import os
import json
import pandas as pd
import gspread as gp
import dotenv as env
from flask_cors import CORS
from flask import Flask, Response, request
from oauth2client.service_account import ServiceAccountCredentials

env.load_dotenv()

app: Flask = Flask(__name__)
CORS(app)

credentials: ServiceAccountCredentials = ServiceAccountCredentials.from_json_keyfile_name(
    'back/service_account.json', ['https://spreadsheets.google.com/feeds'])

client: gp.client.Client = gp.authorize(credentials)

@app.route("/", methods=['GET', 'POST'])
def main_route() -> Response:
    if request.method == 'GET':
        spread_sheet: gp.Spreadsheet = client.open_by_key(
            os.environ['sheet_key'])
        worksheet: gp.Worksheet = spread_sheet.get_worksheet(0)
        dataframe: pd.DataFrame = pd.DataFrame(worksheet.get_all_records())
        dataframe['is_available'] = dataframe['is_available'].astype('bool')
        dataframe = dataframe.loc[dataframe['is_available'] == True]
        response: Response = Response(response=json.dumps(
            dataframe.to_dict('records')), status=200, content_type="application/json", headers={"Access-Control-Allow-Origin": "*"})

        return response

    if request.method == 'POST':
        product_id = request.json.get('product_id')
        first_name = request.json.get('first_name')
        last_name = request.json.get('last_name')
        email = request.json.get('email')

        if product_id != None and first_name != None and last_name != None and email != None:
            spread_sheet: gp.Spreadsheet = client.open_by_key(
                os.environ['sheet_key'])
            worksheet: gp.Worksheet = spread_sheet.get_worksheet(0)
            worksheet.update_cell(product_id, 6, 0)
            worksheet.update_cell(product_id, 8, first_name)
            worksheet.update_cell(product_id, 9, last_name)
            worksheet.update_cell(product_id, 10, email)

        response: Response = Response(response=json.dumps(
            {"message": "success!"}), status=200, content_type="application/json", headers={"Access-Control-Allow-Origin": "*"})

        return response


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
