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
import { Card, CardBody, CartesianGrid, HeadingText, NrqlQuery, Spinner, AutoSizer } from 'nr1';
import { DateTime } from 'luxon';
const createTrend = require('trendline');

export default class LineGraphWithDeploymentsVisualization extends React.Component {
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


    transformData = (rawData) => {
        let list = [];
        rawData[0].data.forEach(item => {
            list.push({ x: item.x, y: item.y });
        });

        return list;
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
        rawData.forEach(item => {
            list.push(<Line name={item.metadata.name} data={this.getBasicPoints(item.data)} type="monotone" dataKey="y" stroke={item.metadata.color} strokeWidth={1} dot={false} />);
        })
        return list;
    }

    /**
     * Format the given axis tick's numeric value into a string for display.
     */
    formatTick = (value) => {
        return DateTime.fromMillis(value).toFormat("yyyy LLL dd HH:mm:ss");
    };

    render() {
        const { accountId, areasQuery, eventQuery, eventColor, numberOfTicks, showEvents, showTrendLine, timeseriesQuery, timeseriesColor } = this.props;
        let events;
        // const nrqlQueryPropsAvailable =
        // eventQuery &&
        // timeseriesQuery &&
        //     accountId &&
        //     timeseriesQuery.query;

        // if (!nrqlQueryPropsAvailable) {
        //     return <EmptyState />;
        // }

        return (

            <AutoSizer>
                {({ width, height }) => (

                    <NrqlQuery
                        query={timeseriesQuery}
                        accountId={parseInt(accountId)}
                        pollInterval={NrqlQuery.AUTO_POLL_INTERVAL}
                    >
                        {({ data, loading, error }) => {

                            var transformedData = [];
                            var timeSerieslines;
                            if (data != null) {
                                timeSerieslines = this.getTimeSeriesLines(data);
                                transformedData = this.transformData(data);
                            }

                            return (
                                <NrqlQuery
                                    query={eventQuery}
                                    accountId={parseInt(accountId)}
                                    pollInterval={NrqlQuery.AUTO_POLL_INTERVAL}
                                >
                                    {({ data, loading, error }) => {

                                        if (transformedData.length === 0) {
                                            return <EmptyState />;
                                        } else {
                                            let yValues = transformedData.map((item) => item.y);
                                            let xValues = transformedData.map((item) => item.x);
                                            let yMax = Math.max(...yValues);
                                            let yMin = Math.min(...yValues);
                                            let xMax = Math.max(...xValues);
                                            let xMin = Math.min(...xValues);

                                            console.log('timeseries color:');
                                            console.log(timeseriesColor);
                                            console.log('timeseries query:');
                                            console.log(timeseriesQuery);
                                            console.log('timeseries data:');
                                            console.log(transformedData);
                                            console.log('eventQuery:');
                                            console.log(eventQuery);
                                            console.log('eventQuery data:');
                                            console.log(data);
                                            console.log('xMin');
                                            console.log(xMin);
                                            console.log('xMax');
                                            console.log(xMin);

                                            let events = [];
                                            let areasEvents = [];
                                            let trendData = [];
                                            var trendLine;

                                            if (showEvents == true) {
                                                data != null ? data[0]?.data?.forEach(item => {
                                                    // console.log('adding new event');
                                                    // console.log(item.x);
                                                    events.push(<ReferenceLine fillOpacity="0.1" x={item.x} stroke={eventColor || "grey"} strokeWidth="1" label={{ position: 'left', angle: 90, value: item.name, fill: eventColor || 'grey', fontSize: 8 }} />);

                                                }) : ''
                                            }

                                            if (showTrendLine === true && transformedData.length !== 0) {
                                                let trend = createTrend(transformedData, 'x', 'y');
                                                xValues.forEach((xValue) => {
                                                    trendData.push({ y: trend.calcY(xValue), x: xValue })
                                                });
                                                trendLine = <Line name="trend" data={trendData} type="linear" dataKey="y" stroke="red" dot={false} />;
                                            }
                                            
                                            return (
                                                <NrqlQuery
                                    query={areasQuery}
                                    accountId={parseInt(accountId)}
                                    pollInterval={NrqlQuery.AUTO_POLL_INTERVAL}
                                >
                                    {({ data, loading, error }) => {
                                            console.log('areasQuery data');
                                            console.log(data);
                                            data != null ? data[0]?.data?.forEach(item => {
                                                // console.log('adding new event');
                                                // console.log(item.x);
                                                areasEvents.push(<ReferenceArea x1={item.start} x2={item.end} stroke="red" fill="pink" strokeOpacity={0.3} label={item.name} />);

                                            }) : ''
                                            console.log(areasEvents);
                                            return (
                                                <LineChart
                                                    width={width}
                                                    height={height}
                                                    margin={{
                                                        top: 5,
                                                        right: 30,
                                                        left: 20,
                                                        bottom: 5,
                                                    }}>
<Legend/>
                                                    <XAxis dataKey="x" type="number" tickCount={numberOfTicks} tick={{ fill: 'grey', fontSize: 8 }}  domain={['auto', 'auto']} />
                                                    <YAxis domain={['auto', 'auto']} />
                                                    <CartesianGrid/>
                                                    {events}
                                                    {areasEvents}
                                                    {trendLine}
                                                    {timeSerieslines}
                        
                                                </LineChart>)
                                    }}
                                                </NrqlQuery>)
                                        }
                                    }}
                                </NrqlQuery>)
                        }}
                    </NrqlQuery>
                )}
            </AutoSizer>
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
                SELECT percentage(count(*), WHERE result = 'SUCCESS') *100 FROM SyntheticCheck WHERE custom.Solution IN ('Financial Reporting', 'Home', 'Integrated Risk', 'Operational Reporting', 'XBRL Financial Reporting') AND custom.Domain ='app.wdesk.com' FACET custom.Solution TIMESERIES LIMIT MAX SINCE 1 week ago
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
