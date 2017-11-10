export class JsonParser {
   
    /**
     * Generate the CSV from string data
     * @param apiData Data sent via API or another JSON string
     */
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

   /**
    * Parse header dynamically - take the first JSON object and use the keys - Recursive Method
    * @param data JSON data representation of the object to parse header from
    * @param isTopLevel Flag to indicate in the recursion that we are at the first call to the method
    */
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

    /**
     * Parse data via recursion
     * @param data JSON data representation of the object
     * @param isRecursive Flag to indicate in the recursion that we are at the first call to the method
     */
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

    /**
     * Format the results into a CSV defined style 
     * @param data Data to format
     */
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

    /**
     * Export the CSV to the browser window
     * @param data Data to export as a CSV
     */
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