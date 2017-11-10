export class JsonParser {
   
    getCsvFromData(apiData: string) {

        //Data we are working with
        const data = JSON.parse(apiData);

        //Header row data
        const headerData = this.parseHeader(data, true);

        //Body data
        const rowData = this.parseData(data, false);

        //Combined into one for export
        const completeData = this.formatToCsv(headerData) + "\r\n" + this.formatToCsv(rowData);

        //Do the thing and export it
        this.exportCsv(completeData);

    }

    //Recursive method to generate a header based on the first element in the collection
    private parseHeader(data: JSON, isTopLevel: boolean) {
        const headerData = [];

        if (!!data) {
            if (isTopLevel) {
                const topLevelObject = data[0];

                //Only Check the first element
                for (let key in topLevelObject) {
                    if (topLevelObject.hasOwnProperty(key)) {
                        //Array Type
                        if (!!topLevelObject[key] && Array.isArray(topLevelObject[key])) {
                            headerData.push(this.parseHeader(topLevelObject[key], false));
                        }
                        //Object Type
                        else if (!!topLevelObject[key] &&
                            Object.prototype.toString.call(topLevelObject[key]) === '[object Object]') {
                            headerData.push(this.parseHeader(topLevelObject[key], false));
                        }
                        //Regular Property Type
                        else {
                            headerData.push(key);
                        }
                    }
                }
            }
            else {
                for (let key in data) {
                    if (data.hasOwnProperty(key)) {
                        //Array Type
                        if (!!data[key] && Array.isArray(data[key])) {
                            headerData.push(this.parseHeader(data[key], false));
                        }
                        //Object Type
                        else if (!!data[key] && Object.prototype.toString.call(data[key]) === '[object Object]') {
                            headerData.push(this.parseHeader(data[key], false));
                        }
                        //Regular Property Type
                        else {
                            headerData.push(key);
                        }
                    }
                }
            }
        }

        return headerData;
    }

    //Recursive method to parse the row data out
    private parseData(data: JSON, isRecursive: boolean) {
        const rowData = [];

        for (let key in data) {
            if (data.hasOwnProperty(key)) {
                //Array Type
                if (!!data[key] && Array.isArray(data[key])) {
                    rowData.push(this.parseData(data[key], true));
                }
                //Object Type
                else if (!!data[key] && Object.prototype.toString.call(data[key]) === '[object Object]') {
                    rowData.push(this.parseData(data[key], true));
                }
                //Regular Property Type
                else {
                    if (!!data[key]) {
                        let element = data[key].toString().replace(/,/g, ''); // Replace any commas
                        element = element.replace(/\r?\n|\r/g, ';'); //Replace New Lines
                        rowData.push(element);
                    } else {
                        rowData.push(data[key]);

                    }
                }

                ////End of row
                if (!isRecursive) {
                    rowData.push("\r\n");
                }
            }
        }


        return rowData;
    }

    //Parse code into a friendly CSV format
    private formatToCsv(data: any[]) {
        let csvString = '';

        for (let element of data) {
            if (!!element && Array.isArray(element)) {
                csvString += this.formatToCsv(element);
            }
            else {
                csvString += (!!element && element.includes("\r\n")) ? element : element + ','; //Check for end of row - don't add (,)
            }
        }

        return csvString;
    }

    //Do the export magic
    private exportCsv(data: string) {
        const csv = 'data:text/csv;charset=utf-8;,';
        const uri = encodeURI(csv + data);

        const link = document.createElement('a');
        link.setAttribute('href', uri);
        link.setAttribute('download', "data.csv");
        document.body.appendChild(link);

        link.click();
    }
}