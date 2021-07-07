import React from 'react';
import PropTypes from 'prop-types';
import {
    Line,
    LineChart,
    CartesianGrid,
    Legend,
    XAxis,
    YAxis,
    ReferenceArea,
    ReferenceLine,
    Tooltip
} from 'recharts';
import { Card, CardBody, HeadingText, NrqlQuery, Spinner, AutoSizer } from 'nr1';
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
        console.log('rawData:');
        console.log(rawData);
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
            console.log(item.metadata.color);
            list.push(<Line name={item.metadata.name} data={this.getBasicPoints(item.data)} type="linear" dataKey="y" stroke={item.metadata.color} strokeWidth={2} dot={false} />);
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
        const { accountId, eventQuery, eventColor, showEvents, showTrendLine, timeseriesQuery, timeseriesColor } = this.props;
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
                                
                                console.log('timeSerieslines');
                                console.log(timeSerieslines);
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

                                            let lines = [];
                                            let trendData = [];
                                            var trendLine;

                                            if (showEvents == true) {
                                                console.log('showEvents is true');
                                                data != null ? data[0]?.data?.forEach(item => {
                                                    // console.log('adding new event');
                                                    // console.log(item.x);
                                                    lines.push(<ReferenceLine fillOpacity="0.1" x={item.x} stroke={eventColor || "grey"} strokeWidth="1" label={{ position: 'left', angle: 90, value: item.name, fill: eventColor || 'grey', fontSize: 10 }} />);

                                                }) : ''
                                            }

                                            if (showTrendLine === true && transformedData.length !== 0) {
                                                console.log('show trend line');

                                                let trend = createTrend(transformedData, 'x', 'y');
                                                console.log('trend:');
                                                console.log(trend);
                                                xValues.forEach((xValue) => {
                                                    trendData.push({ y: trend.calcY(xValue), x: xValue })
                                                });
                                                trendLine = <Line name="trend" data={trendData} type="linear" dataKey="y" stroke="red" dot={false} />;
                                            }

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
                                                    <Legend verticalAlign="top" height={36}/>
                                                    <XAxis dataKey="x" type="number" tickCount="10" tick={{ fill: 'grey', fontSize: 8 }} tickFormatter={this.formatTick} domain={['auto', 'auto']} />
                                                    <YAxis dataKey="y" domain={[yMin, yMax]} />
                                                    {trendLine}
                                                    {timeSerieslines}
                                                    {lines}
                                                </LineChart>)
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
            <br/><br/>
            <code>
                SELECT timestamp, deployment.release.name as 'name', deployment.service FROM SoftwareDevelopmentLifecycle WHERE event = 'deploy_complete' AND deployment.environment = 'prod' LIMIT MAX SINCE 1 week ago
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
