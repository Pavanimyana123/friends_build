import React from "react";

import { Page, Text, View, Document, StyleSheet, Image } from "@react-pdf/renderer";
import logo1 from '../../../Pages/Images/logo.jpeg'
import { toWords } from "number-to-words";


// Define styles
const styles = StyleSheet.create({
    page: {
        padding: 5,
        fontSize: 8,

    },
    section: {
        marginBottom: 10,
    },
    row: {
        display: "flex",
        flexDirection: "row",
        marginBottom: 10,
    },
    // column: {
    //         width: '33%',
    // },
    boldText: {
        fontWeight: "bold",

    },
    image1: {
        // width: 100,
        // height: 100,
        marginTop: 0,
    },
    image2: {
        // width: 50,
        // height: 50,
        marginTop: 0,
    },
    divider: {
        marginVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#000",
        borderBottomStyle: "solid",
    },

    container: {
        flex: 1,
        // justifyContent: 'center', 
        alignItems: 'center',  // Centers the content horizontally
        padding: 20,
        marginTop: -50,
    },
    heading: {
        fontWeight: 'bold',
        fontSize: 12,
        textAlign: 'center',
        marginBottom: 5,
        marginTop: -20
    },
    contentContainer: {
        flexDirection: 'row',  // Side by side layout
        alignItems: 'center',
        justifyContent: 'center',
        borderBottomWidth: 1,  // Horizontal line under both sections
        borderColor: 'black',
        // paddingBottom: 20,
        width: '100%',  // Ensure it spans the entire width
    },
    leftColumn: {
        // flex: 1,
        // paddingLeft: 100,
        marginLeft: 140,
    },
    label: {
        fontWeight: 'bold', // Makes the label bold
    },
    row: {
        marginBottom: 3, // Adds spacing between rows
        textAlign: 'left',
    },
    rightColumn: {
        flex: 1,
        paddingLeft: 10,
    },
    flatNo: {
        marginBottom: 2,
    },
    cin: {
        marginBottom: 2,
    },
    branch: {
        fontWeight: 'bold',
        marginBottom: 2,
    },
    branchContent: {
        marginBottom: 2,
    },
    divider1: {
        width: 1,
        height: '100%',
        backgroundColor: 'black',
    },

    horizontalLine1: {
        width: '100%',  // Set width to 70%
        height: 1,
        // backgroundColor: 'black',
        alignSelf: 'center',  // Centers the line horizontally within its container
        marginBottom: 2,
    },

    horizontalLine: {
        width: '100%',  // Set width to 70%
        height: 1,
        backgroundColor: 'black',
        alignSelf: 'center',  // Centers the line horizontally within its container
        marginBottom: 2,
    },
    boxContainer: {
        width: '100%',
        height: 330,
        marginTop: 5,
        border: '1px solid black',
        marginBottom: 20,
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
    },
    tableHeader: {
        backgroundColor: '#f2f2f2',
        fontWeight: 'bold',
        borderBottomWidth: 1,
        borderBottomColor: '#000',
    },
    tableCell: {
        // border: '1px solid #000',
        padding: 5,
        textAlign: 'center',
    },
    tableRow: {
        display: 'flex',
        flexDirection: 'row',
    },
    tableCellHeader: {
        width: '5%',
    },
    tableCellDescription: {
        width: '18%',
    },
    tableCellHSN: {
        width: '9%',
    },
    tableCellQty: {
        width: '5%',
    },
    tableCellPurity: {
        width: '8%',
    },
    tableCellGrossWt: {
        width: '11%',
    },
    tableCellStoneWt: {
        width: '11%',
    },
    tableCellNetWt: {
        width: '11%',
    },
    tableCellRate: {
        width: '10%',
    },
    tableCellMC: {
        width: '8%',
    },
    tableCellStAmt: {
        width: '10%',
    },
    tableCellTotal: {
        width: '10%',
    },

    lastheight: {
        height: 30,
    },
});

const TaxINVoiceReceipt = ({ selectedOrders, estimateNumber }) => {
    console.log("selected orders=", selectedOrders);
    const toWordsTitleCase = (num) => {
        return toWords(num)
            .split(" ")
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    };

    const totalQty = selectedOrders.reduce((sum, order) => sum + parseFloat(order.qty || 0), 0);
    const totalGrossWeight = selectedOrders.reduce((sum, order) => sum + parseFloat(order.gross_weight || 0), 0);
    const totalNetWeight = selectedOrders.reduce((sum, order) => sum + parseFloat(order.total_weight_aw || 0), 0);
    const totalMetalAmount = selectedOrders.reduce((sum, order) => sum + parseFloat(order.amount || 0), 0);
    const totalStoneAmount = selectedOrders.reduce((sum, order) => sum + parseFloat(order.stone_price || 0), 0);
    const totalMC = selectedOrders.reduce((sum, order) => sum + parseFloat(order.total_mc || 0), 0);

    const taxableAmount = totalMetalAmount + totalStoneAmount + totalMC;
    const taxAmount = selectedOrders.reduce((sum, order) => sum + parseFloat(order.tax_amount || 0), 0);
    const halfTax = (taxAmount / 2).toFixed(2);
    const totalPrice = selectedOrders.reduce((sum, order) => sum + parseFloat(order.total_price || 0), 0);
    const totalPriceInWords = toWordsTitleCase(taxableAmount);

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* First Row */}
                <View style={[styles.row, { flexDirection: 'row', justifyContent: 'space-between', marginBottom: '20px' }]}>
                    {selectedOrders.length > 0 && (
                        <View style={[styles.column, { marginTop: 20, width: '20%', marginLeft: 20, fontFamily: 'Times-Bold' }]}>
                            <Text style={[styles.boldText, { marginBottom: 6 }]}>CUSTOMER DETAILS:</Text>
                            <Text style={{ marginBottom: 6 }}>{selectedOrders[0].account_name || "N/A"},</Text>
                            <Text style={{ marginBottom: 6 }}>{selectedOrders[0].city || "N/A"}</Text>
                            <Text style={{ marginBottom: 6 }}>MOBILE: {selectedOrders[0].mobile || "N/A"}</Text>
                            <Text style={{ marginBottom: 6 }}>PAN NO: {selectedOrders[0].pan_card || "N/A"}</Text>
                        </View>
                    )}
                    <View style={[styles.column, { width: '25%', height: '60px', marginRight: '20px' }]}>
                        <Image
                            style={styles.image1}
                            src={logo1}
                        />
                    </View>
                    <View style={[styles.column, { marginTop: 10, width: '20%', marginRight: '20px', fontFamily: 'Times-Bold' }]}>
                        <Text style={{ fontWeight: 'bold', fontSize: 14, marginBottom: 10, marginLeft: 20 }}>ESTIMATE</Text>
                        {/* <View style={{ alignItems: 'center', marginBottom: 10 }}>
                                                        <Barcode value="SV1224" format="CODE128" width={1.5} height={50} />
                                                </View> */}

                        {/* BILL NO */}
                        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
                            <Text>ESTIMATE NO:</Text>
                            <Text style={{ textAlign: "right", flex: 1 }}>{estimateNumber}</Text>
                        </View>

                        {/* DATE */}
                        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
                            <Text>DATE:</Text>
                            <Text style={{ textAlign: "right", flex: 1 }}>22-03-2025</Text>
                        </View>

                        {/* STAFF */}
                        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
                            <Text>STAFF:</Text>
                            <Text style={{ textAlign: "right", flex: 1 }}>New Friend's Jewellery</Text>
                        </View>

                        {/* GSTIN */}
                        {/* <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
                            <Text>GSTIN:</Text>
                            <Text style={{ textAlign: "right", flex: 1 }}>38RQAPS4222R1ZT</Text>
                        </View> */}
                    </View>
                </View>
                <View style={styles.container}>
                    <Text style={[styles.heading, { fontFamily: 'Times-Bold' }]}>NEW FRIEND'S JEWELLERY</Text>
                    <View style={styles.contentContainer}>
                        <View style={styles.leftColumn}>
                            <Text style={styles.row}><Text style={styles.label}>Flat No.:</Text> SHOP NO.F2</Text>
                            <Text style={styles.row}><Text style={styles.label}>Building:</Text> SKITCHAN NGODUP COMPLEX</Text>
                            <Text style={styles.row}><Text style={styles.label}>Road/Street:</Text> NEAR OLD BUS STAND</Text>
                            <Text style={styles.row}><Text style={styles.label}>Locality/Sub Locality:</Text> LEH</Text>
                        </View>
                        <View style={styles.divider1} />
                        <View style={styles.rightColumn}>
                            <Text style={styles.row}><Text style={styles.label}>City/Town/Village:</Text> Leh,</Text>
                            <Text style={styles.row}><Text style={styles.label}>District:</Text> Leh Ladakh,</Text>
                            <Text style={styles.row}><Text style={styles.label}>State:</Text>  Ladakh</Text>
                            <Text style={styles.row}><Text style={styles.label}>PIN Code:</Text> 194101</Text>
                        </View>
                    </View>
                    <View style={styles.horizontalLine1} />
                    <View>
                        <Text>
                            MOBILE : 9928541909
                        </Text>
                    </View>
                    <View style={styles.boxContainer}>
                        <View style={styles.table}>
                            <View style={[styles.tableRow, { fontFamily: 'Times-Bold' }]}>
                                <Text style={[styles.tableCell, styles.tableCellHeader]}>SI</Text>
                                <View style={styles.divider1} />

                                <Text style={[styles.tableCell, styles.tableCellDescription]}>Product Name</Text>
                                <View style={styles.divider1} />

                                {/* <Text style={[styles.tableCell, styles.tableCellHSN]}>HSN</Text>
                                                                <View style={styles.divider1} /> */}

                                <Text style={[styles.tableCell, styles.tableCellQty]}>Qty</Text>
                                <View style={styles.divider1} />

                                <Text style={[styles.tableCell, styles.tableCellPurity]}>Purity</Text>
                                <View style={styles.divider1} />

                                <Text style={[styles.tableCell, styles.tableCellGrossWt]}>Gross.Wt(In Gms)</Text>
                                <View style={styles.divider1} />

                                <Text style={[styles.tableCell, styles.tableCellStoneWt]}>Stone.Wt(In Gms)</Text>
                                <View style={styles.divider1} />

                                <Text style={[styles.tableCell, styles.tableCellNetWt]}>Net.Wt(In Gms) </Text>
                                <View style={styles.divider1} />

                                <Text style={[styles.tableCell, styles.tableCellRate]}>Rate</Text>
                                <View style={styles.divider1} />

                                <Text style={[styles.tableCell, styles.tableCellMC]}>MC</Text>
                                <View style={styles.divider1} />

                                <Text style={[styles.tableCell, styles.tableCellStAmt]}>St.Amt</Text>
                                <View style={styles.divider1} />

                                <Text style={[styles.tableCell, styles.tableCellTotal]}>Total</Text>
                            </View>
                            <View style={styles.horizontalLine} />
                            {selectedOrders.map((order, index) => (
                                <View style={styles.tableRow} key={index}>
                                    <Text style={[styles.tableCell, styles.tableCellHeader]}>{index + 1}</Text>
                                    <View style={[styles.divider1, { marginTop: -2 }]} />

                                    <Text style={[styles.tableCell, styles.tableCellDescription]}>{order.subcategory || "N/A"}</Text>
                                    <View style={[styles.divider1, { marginTop: -2 }]} />

                                    {/* <Text style={[styles.tableCell, styles.tableCellHSN]}>711311</Text>
                                                                <View style={[styles.divider1, { marginTop: -2 }]} /> */}

                                    <Text style={[styles.tableCell, styles.tableCellQty]}>{order.qty || "N/A"}</Text>
                                    <View style={[styles.divider1, { marginTop: -2 }]} />

                                    <Text style={[styles.tableCell, styles.tableCellPurity]}>{order.purity || "N/A"}</Text>
                                    <View style={[styles.divider1, { marginTop: -2 }]} />

                                    <Text style={[styles.tableCell, styles.tableCellGrossWt]}>{order.gross_weight || "N/A"}</Text>
                                    <View style={[styles.divider1, { marginTop: -2 }]} />

                                    <Text style={[styles.tableCell, styles.tableCellStoneWt]}>{order.stone_weight || "N/A"}</Text>
                                    <View style={[styles.divider1, { marginTop: -2 }]} />

                                    <Text style={[styles.tableCell, styles.tableCellNetWt]}>{order.total_weight_aw || "N/A"}</Text>
                                    <View style={[styles.divider1, { marginTop: -2 }]} />

                                    <Text style={[styles.tableCell, styles.tableCellRate]}>{order.rate || "N/A"}</Text>
                                    <View style={[styles.divider1, { marginTop: -2 }]} />

                                    <Text style={[styles.tableCell, styles.tableCellMC]}>{order.total_mc || "N/A"}</Text>
                                    <View style={[styles.divider1, { marginTop: -2 }]} />

                                    <Text style={[styles.tableCell, styles.tableCellStAmt]}>{order.stone_price || "N/A"}</Text>
                                    <View style={[styles.divider1, { marginTop: -2 }]} />

                                    <Text style={[styles.tableCell, styles.tableCellTotal]}>
                                        {(parseFloat(order.total_mc || 0) + parseFloat(order.amount || 0) + parseFloat(order.stone_price || 0)).toFixed(2)}
                                    </Text>


                                </View>
                            ))}
                            <View style={styles.tableRow}>
                                <Text style={[styles.tableCell, styles.tableCellHeader]}></Text>
                                <View style={[styles.divider1, { marginTop: -2 }]} />


                                <Text style={[styles.tableCell, styles.tableCellDescription]}></Text>
                                <View style={[styles.divider1, { marginTop: -2 }]} />

                                {/* <Text style={[styles.tableCell, styles.tableCellHSN]}></Text>
                                                                <View style={[styles.divider1, { marginTop: -2 }]} /> */}

                                <Text style={[styles.tableCell, styles.tableCellQty]}></Text>
                                <View style={[styles.divider1, { marginTop: -2 }]} />

                                <Text style={[styles.tableCell, styles.tableCellPurity]}></Text>
                                <View style={[styles.divider1, { marginTop: -2 }]} />

                                <Text style={[styles.tableCell, styles.tableCellGrossWt]}></Text>
                                <View style={[styles.divider1, { marginTop: -2 }]} />

                                <Text style={[styles.tableCell, styles.tableCellStoneWt]}></Text>
                                <View style={[styles.divider1, { marginTop: -2 }]} />

                                <Text style={[styles.tableCell, styles.tableCellNetWt]}></Text>
                                <View style={[styles.divider1, { marginTop: -2 }]} />

                                <Text style={[styles.tableCell, styles.tableCellRate]}></Text>
                                <View style={[styles.divider1, { marginTop: -2 }]} />

                                <Text style={[styles.tableCell, styles.tableCellMC]}></Text>
                                <View style={[styles.divider1, { marginTop: -2 }]} />

                                <Text style={[styles.tableCell, styles.tableCellStAmt]}></Text>
                                <View style={[styles.divider1, { marginTop: -2 }]} />

                                <Text style={[styles.tableCell, styles.tableCellTotal]}></Text>
                            </View>
                        </View>
                        <View style={[styles.horizontalLine, { marginTop: -2 }]} />
                        <View style={[styles.tableRow, { fontFamily: 'Times-Bold' }]}>
                            <Text style={[styles.tableCell, styles.tableCellHeader, styles.lastheight]}></Text>
                            <View style={[styles.divider1, { marginTop: -2 }]} />


                            <Text style={[styles.tableCell, styles.tableCellDescription, styles.lastheight]}></Text>
                            <View style={[styles.divider1, { marginTop: -2 }]} />

                            {/* <Text style={[styles.tableCell, styles.tableCellHSN, styles.lastheight]}></Text>
                                                        <View style={[styles.divider1, { marginTop: -2 }]} /> */}

                            <Text style={[styles.tableCell, styles.tableCellQty, styles.lastheight]}>{totalQty}</Text>
                            <View style={[styles.divider1, { marginTop: -2 }]} />

                            <Text style={[styles.tableCell, styles.tableCellPurity, styles.lastheight]}></Text>
                            <View style={[styles.divider1, { marginTop: -2 }]} />

                            <Text style={[styles.tableCell, styles.tableCellGrossWt, styles.lastheight]}>{totalGrossWeight.toFixed(3)}</Text>
                            <View style={[styles.divider1, { marginTop: -2 }]} />

                            <Text style={[styles.tableCell, styles.tableCellStoneWt, styles.lastheight]}></Text>
                            <View style={[styles.divider1, { marginTop: -2 }]} />

                            <Text style={[styles.tableCell, styles.tableCellNetWt, styles.lastheight]}>{totalNetWeight.toFixed(3)}</Text>
                            <View style={[styles.divider1, { marginTop: -2 }]} />

                            <Text style={[styles.tableCell, styles.tableCellRate, styles.lastheight]}></Text>
                            <View style={[styles.divider1, { marginTop: -2 }]} />

                            <Text style={[styles.tableCell, styles.tableCellMC, styles.lastheight]}></Text>
                            <View style={[styles.divider1, { marginTop: -2 }]} />

                            <Text style={[styles.tableCell, styles.tableCellStAmt, styles.lastheight]}></Text>
                            <View style={[styles.divider1, { marginTop: -2 }]} />

                            <Text style={[styles.tableCell, styles.tableCellTotal, styles.lastheight]}>{taxableAmount.toFixed(2)}</Text>
                        </View>
                        <View style={[styles.horizontalLine, { marginTop: -2 }]} />



                        <View style={{ alignItems: "flex-end", marginTop: 5, paddingRight: 10 }}>
                            <View style={{ flexDirection: "row" }}>
                                <Text style={{ fontWeight: "bold", marginRight: 5 , fontFamily: 'Times-Bold'}}>Total Amount:</Text>
                                <Text>{taxableAmount.toFixed(2)}</Text>
                            </View>
                        </View>

                        <View style={{ alignItems: "center", fontFamily: 'Times-Bold' }}>
                            <Text>
                                (Rupees {totalPriceInWords} Only)
                            </Text>
                        </View>

                        <View style={{ flexDirection: "row", marginTop: 20, justifyContent: "space-between", marginBottom: 3, fontFamily: 'Times-Bold' }}>
                            {/* Left Side */}
                            <View style={{ alignItems: "flex-start", paddingLeft: 10 }}>
                                <Text style={[styles.bold]}>For Customer</Text>
                            </View>

                            {/* Right Side */}
                            <View style={{ alignItems: "flex-end", paddingRight: 10 }}>
                                <Text style={[styles.bold]}>For NEW FRIEND'S JEWELLERY</Text>
                            </View>
                        </View>



                    </View>

                </View>

                <View></View>
            </Page>
        </Document>
    );
};

export default TaxINVoiceReceipt;