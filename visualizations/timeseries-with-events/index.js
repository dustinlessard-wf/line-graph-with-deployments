import React from 'react';
import PropTypes from 'prop-types';
import {
    Line,
    LineChart,
    Legend,
    XAxis,
    YAxis,
    ReferenceArea,
    ReferenceLine
} from 'recharts';
import { Card, CardBody, CartesianGrid, HeadingText, NrqlQuery, Spinner, AutoSizer, GridItem, BillboardChart, PlatformStateContext } from 'nr1';
import { DateTime } from 'luxon';
import { timeRangeToNrql } from '@newrelic/nr1-community';
const createTrend = require('trendline');

class NrqlQueries extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            queryPromises: this.props.nrqlQueries.map(() => ({
                loading: true,
            }))
        };
    }

    componentWillUnmount() {
        //console.log('component will unmount');
        // const queryPromises = this.props.nrqlQueries.map((nrqlQuery) =>
        //     NrqlQuery.query(nrqlQuery)
        // );


        // Promise.all(queryPromises).then((data) => {
        //     console.log('all promises resolved');
        //     this.setState({
        //         queryPromises: data,
        //     })
        // })
    }

    componentDidUpdate(prevProps) {
        //console.log('componentDidUpdate');
        this.props.isQuerying = true;
        if (prevProps.nrqlQueries !== this.props.nrqlQueries) {
            // console.log('re-query NR');
            // console.log(`previous nrqlQueries: ${prevProps.nrqlQueries}`);
            // console.log(`current nrqlQueries: ${this.props.nrqlQueries}`);
            const queryPromises = this.props.nrqlQueries.map((nrqlQuery) =>
                NrqlQuery.query(nrqlQuery)
            );

            Promise.all(queryPromises).then((data) => {
                // console.log('all promises resolved');
                this.setState({
                    queryPromises: data,
                })
            })
        }
    }

    render() {
        // if (this.state.queryPromises.length === 0) return null;
        return this.props.children(this.state.queryPromises)
    }
}

export default class YetAnotherLineGraphVisualization extends React.Component {

    // Custom props you wish to be configurable in the UI must also be defined in
    // the nr1.json file for the visualization. See docs for more details.
    static propTypes = {
        /**
         * A fill color to override the default fill color. This is an example of
         * a custom chart configuration.
         */
        fill: PropTypes.string,

        /**
         * A stroke color to override the default stroke color. This is an example of
         * a custom chart configuration.
         */
        stroke: PropTypes.string,
        /**
         * An array of objects consisting of a nrql `query` and `accountId`.
         * This should be a standard prop for any NRQL based visualizations.
         */

    };

    getBasicPoints = (listOfData) => {
        let list = [];
        listOfData.forEach(item => {
            list.push({ x: item.x, y: item.y });
        });
        return list;
    }

    getTimeSeriesLines = (rawData) => {
        let list = [];
        console.log(rawData);
        if ((rawData.loading == false)) {
            rawData.data.forEach(item => {
                list.push(<Line name={item.metadata.name} data={this.getBasicPoints(item.data)} type="monotone" dataKey="y" stroke={item.metadata.color} strokeWidth={configs[i].lineWidth || 1} dot={false} />);
            });
        }
        return list;
    }

    /**
     * Format the given axis tick's numeric value into a string for display.
     */
    formatTick = (value) => {
        return DateTime.fromMillis(value).toFormat("yyyy LLL dd HH:mm:ss");
    };

    render() {
        const { settings, timeseriesQueries, tsThickness, eaaHideLabels, eaaHideResults, ealHideLabels, ealHideResults, eventsAsLinesQueries, eventsAsAreasQueries, showTrendLine, trendLineThickness } = this.props;

        // const nrqlQueryPropsAvailable =
        // eventQuery &&
        // timeseriesQuery &&
        //     accountId &&
        //     timeseriesQuery.query;

        // if (!nrqlQueryPropsAvailable) {
        //     return <EmptyState />;
        // }

        return (
            <PlatformStateContext.Consumer>
                {(platformState) => { 
                    //console.log(platformState);
                    const since = timeRangeToNrql(platformState);
                    //console.log(`since:${since}`);
                    return (  
            <AutoSizer>
                {({ width, height }) => {
                    //console.log(timeseriesQueries);
                    var tsqs = []; //timeseries queries
                    var ealqs = []; //events as lines queries
                    var eaaqs = []; //events as areas queries
                    var queries = [];

                    var tsPromises = [];
                    var ealPromises = [];
                    var eaaPromises = [];   

                    var configs = [];
                    var ealconfigs = [];
                    var eaaconfigs = [];

                    var tsLines = [];
                    var ealLines = [];
                    var eaaAreas = [];
                    var trendLines = [];

                    let getBasicPoints = this.getBasicPoints;
                    let me = this;
                    let types = [];

                    timeseriesQueries.forEach(function (item, i) {
                        queries.push({ accountId: settings.accountId, query: item.tsquery.includes('SINCE')? item.tsquery:item.tsquery.concat(' ', since), type: 'ts' });
                        configs.push({ color: 'red', lineThickness: item.tsThickness, showTrendLine: item.showTrendLine }); //todo: grab color
                        types.push('timeseries');
                    });

                    eventsAsLinesQueries.forEach(function (item, i) {
                        if (!item.ealquery) { return; }
                        queries.push({ accountId: settings.accountId, query: item.ealquery.concat(' ', since) });
                        ealconfigs.push({ color: item.ealcolor, hideResults: item.ealHideResults, hideLabels: item.ealHideLabels });
                        types.push('eal');
                    });

                    eventsAsAreasQueries.forEach(item => {
                        if (!item.eaaquery) { return; }
                        queries.push({ accountId: settings.accountId, query: item.eaaquery.concat(' ', since) });
                        eaaconfigs.push({ color: item.eaacolor, hideLabels: item.eaaHideLabels, hideResults: item.eaaHideResults });
                        types.push('eaa');
                    });

                    return (<NrqlQueries nrqlQueries={queries}>
                        {(rawData) => {
                            rawData.forEach(function (item, i) {
                                if (item.loading == true) {
                                    return <EmptyState />;
                                }
                                switch (types[i]) {
                                    case 'timeseries':

                                        tsLines = [];
                                        trendLines = [];
                                        if ((item.loading == false)) {
                                            let widths = configs[0].lineThickness != null ? configs[0].lineThickness?.split(','): null;
                                            

                                            item.data.forEach(function (rawData, i) {
                                                //console.log(rawData);
                                                var lineThickness;
                                                
                                                if(widths === null || widths.length === 1){
                                                    lineThickness = configs[0].lineThickness;
                                                } else {
                                                    lineThickness = widths[i];
                                                }
                                                let transformedData = me.getBasicPoints(rawData.data);
                                                tsLines.push(<Line name={rawData.metadata.name} data={transformedData} type="monotone" dataKey="y" stroke={rawData.metadata.color} strokeWidth={lineThickness || 1} dot={false} />);
                                                if (configs[0].showTrendLine === true && transformedData.length !== 0) {
                                                    let trendData = [];
                                                    let xValues = transformedData.map((item) => item.x);
                                                    let trend = createTrend(transformedData, 'x', 'y');
                                                    xValues.forEach((xValue) => {
                                                        trendData.push({ y: trend.calcY(xValue), x: xValue })
                                                    });
                                                    let name = `${rawData.metadata.name}:trend`;
                                                    trendLines.push(<Line name={name} data={trendData} type="linear" dataKey="y" stroke={rawData.metadata.color} strokeDasharray="3 3 3 3" dot={false} />);
                                                }
                                            });
                                        }
                                        break;
                                    case 'eal':
                                        ealLines = [];
                                        item.data.forEach(function (event, i) {
                                            event.data.forEach(function (event, n) {
                                                if (ealconfigs[i].hideResults != true) {
                                                    ealLines.push(<ReferenceLine fillOpacity="0.1" x={event.x} stroke={ealconfigs[i].color || "grey"} strokeWidth="1" label={{ position: 'left', angle: 90, value: ealconfigs[i].hideLabels == true ? '' : event.name, fill: ealconfigs[i].color || 'grey', fontSize: 8 }} />);
                                                }
                                            });
                                        });
                                        //console.log(ealLines);
                                        break;
                                    case 'eaa':
                                        eaaAreas = [];
                                        item.data.forEach(function (event, i) {
                                            //console.log(event);
                                            //console.log('eaa');
                                            //console.log(eaaconfigs[i].color);
                                            event.data.forEach(event => {
                                                if (eaaconfigs[i].hideResults != true) {
                                                    eaaAreas.push(<ReferenceArea x1={event.start} x2={event.end} stroke={eaaconfigs[i].color || "pink"} fill={eaaconfigs[i].color || "pink"} strokeOpacity={0.3} label={{ position: 'left', angle: 90, value: eaaconfigs[i].hideLabels == true ? '' : event.name, fill: eaaconfigs[i].color || 'grey', fontSize: 5 }} />);
                                                }
                                            });
                                        });
                                        //console.log('eaa');
                                        //console.log(item);
                                        break;
                                }
                            });
                            return (<LineChart
                                width={width}
                                height={height}
                                margin={{
                                    top: 5,
                                    right: 30,
                                    left: 20,
                                    bottom: 5,
                                }}>
                                <Legend iconType='plainline' />
                                <XAxis dataKey="x" type="number" tickCount={settings.numberOfTicks} tickFormatter={this.formatTick} tick={{ fill: 'grey', fontSize: 8 }} domain={['auto', 'auto']} />
                                <YAxis domain={['auto', 'auto']} />
                                <CartesianGrid />
                                {ealLines}
                                {eaaAreas}
                                {trendLines}
                                {/* {areasEvents}
                                                                {trendLine} */}
                                {tsLines}

                            </LineChart>);
                        }}
                    </NrqlQueries>)
                }}
            </AutoSizer>
                    )    
        }}
            </PlatformStateContext.Consumer> 
        );
    }
}

const EmptyState = () => (
    <Card className="EmptyState">
        <CardBody className="EmptyState-cardBody">
            <HeadingText
                spacingType={[HeadingText.SPACING_TYPE.LARGE]}
                type={HeadingText.TYPE.HEADING_3}
            >
                Please provide at least one NRQL query & account ID pair
            </HeadingText>
            <HeadingText
                spacingType={[HeadingText.SPACING_TYPE.MEDIUM]}
                type={HeadingText.TYPE.HEADING_4}
            >
                An example NRQL query you can try is:
            </HeadingText>
            <code>
                SELECT percentage(count(*), WHERE result = 'SUCCESS') *100 FROM SyntheticCheck WHERE custom.Solution IN ('Financial Reporting', 'Home', 'Integrated Risk', 'Operational Reporting',
                'XBRL Financial Reporting') AND custom.Domain ='app.wdesk.com' FACET custom.Solution TIMESERIES LIMIT MAX SINCE 1 week ago
            </code>
            <br /><br />
            <code>
                SELECT timestamp, deployment.release.name as 'name', deployment.service FROM SoftwareDevelopmentLifecycle WHERE event = 'deploy_complete' AND deployment.environment = 'prod' AND deployment.category = 'prod' AND deployment.type != 'ApiGatewayDeploy' AND deployment.repository.taxonomy_group != 'Infrastructure' AND deployment.release.name IS NOT NULL AND deployment.release.name like 'c%' OR deployment.release.name like '%d' LIMIT MAX SINCE 1 week ago
            </code>
            <br />
            <br />
            <code>
                FROM OI SELECT ticket as 'name', detect_start as 'start', restore_end as 'end' WHERE detect_start IS NOT NULL
            </code>
        </CardBody>
    </Card>
);

const ErrorState = () => (
    <Card className="ErrorState">
        <CardBody className="ErrorState-cardBody">
            <HeadingText
                className="ErrorState-headingText"
                spacingType={[HeadingText.SPACING_TYPE.LARGE]}
                type={HeadingText.TYPE.HEADING_3}
            >
                Oops! Something went wrong.
            </HeadingText>
        </CardBody>
    </Card>
);
