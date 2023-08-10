import { get, post, put, TelegramBot } from '../cocktail.js';
const headers = {
    "Authorization": "Bearer Lap41lt6JSuvMtkBctbJksSB3KvABtFjMLBvwuRAZhkf2MS_7OKPj8mJz7U",
    "X-Spreadsheet-Id": "17XSsuBuIiX7jL3E-6y29hHutArjYCwv9f1JMW1yPZV8",
    "Content-Type": "application/json",
};
const endPoint = 'https://api.sheetson.com/v2/sheets';
const KEY = `6183481793:AAGFNrrvs6FgATrNhtG5P1j9SAQ0AHxCsyQ`, chatId = '1082707467';
const tb = new TelegramBot(KEY, chatId)

const setData = async ({ dbName, data }) => {
    try {
        return JSON.parse(await post(`${endPoint}/${dbName}`, headers, data))
    } catch (error) {
        throw new Error(error.message)
    }
}

const getData = async ({ dbName, query }) => {
    try {
        return await get(`${endPoint}/${dbName}/?${query}`, headers)
    } catch (error) {
        throw new Error(error.message)
    }
}

const updateData = async ({ dbName, rowNum, oldData, newData }) => {
    try {
        if (!rowNum) {
            const rowData = await getData({ dbName: dbName, query: `where=${JSON.stringify(oldData)}` });
            const row = rowData.results[0].rowIndex;
            return await put(`${endPoint}/${dbName}/${row}`, headers, newData);
        }
        else {
            return await put(`${endPoint}/${dbName}/${rowNum}`, headers, newData);
        }
    } catch (error) {
        throw new Error(error.message)
    }
}


const deleteData = async ({ dbName, rowNum, dataTargted }) => {
    if (!rowNum) {
        const rowData = await getData({ dbName: dbName, query: `where=${JSON.stringify(dataTargted)}` });
        const row = rowData.results[0].rowIndex;
        return await fetch(`${endPoint}/${dbName}/${row}`, { method: "DELETE", headers: headers })
    } else {
        return await fetch(`${endPoint}/${dbName}/${rowNum}`, { method: "DELETE", headers: headers })
    }
}

export { setData, getData, updateData, deleteData, tb }