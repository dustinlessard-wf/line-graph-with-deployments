import React from 'react';
import PropTypes from 'prop-types';
import {
    Line,
    LineChart,
    CartesianGrid,
    XAxis,
    YAxis,
    ReferenceArea,
    ReferenceLine,
    Tooltip
} from 'recharts';
import { Card, CardBody, HeadingText, NrqlQuery, NrqlQueries, Spinner, AutoSizer } from 'nr1';

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
        nrqlQueries: PropTypes.arrayOf(
            PropTypes.shape({
                accountId: PropTypes.number,
                query: PropTypes.string,
            })
        ),
    };


    transformData = (rawData) => {
        let list = [];
        rawData[0].data.forEach(item => {
            list.push({ x: new Date(item.x), y: item.y });
        });

        return list;
    };

    /**
     * Format the given axis tick's numeric value into a string for display.
     */
    formatTick = (value) => {
        return value.toLocaleDateString();
    };

    render() {
        const { nrqlQueries, stroke, fill } = this.props;
        let events;
        const nrqlQueryPropsAvailable =
            nrqlQueries &&
            nrqlQueries[0] &&
            nrqlQueries[0].accountId &&
            nrqlQueries[0].query;

        if (!nrqlQueryPropsAvailable) {

        }

        return (

            <AutoSizer>
                {({ width, height }) => (

                    <NrqlQuery
                        query={nrqlQueries[0].query}
                        accountId={parseInt(nrqlQueries[0].accountId)}
                        pollInterval={NrqlQuery.AUTO_POLL_INTERVAL}
                    >
                        {({ data, loading, error }) => {

                            console.log('data:');
                            console.log(data);

                            var transformedData = [];
                            if (data != null) {
                                transformedData = this.transformData(data);
                            }

                            return (
                                <NrqlQuery
                                    query={nrqlQueries[0].query2}
                                    accountId={parseInt(nrqlQueries[0].accountId)}
                                    pollInterval={NrqlQuery.AUTO_POLL_INTERVAL}
                                >
                                    {({ data, loading, error }) => {
                                        if (data != null) {
                                            
                                            let lines = [];
                                            data != null ? data[0]?.data?.forEach(item => {
                                                lines.push(<ReferenceLine x={item.x} stroke="grey" strokeWidth="1" label={{ position: 'left', angle:90, value: item.name, fill: 'grey', fontSize: 10 }}/>);
                                            }) : ''

                                            return (
                                                <LineChart
                                                    width={width}
                                                    height={height}
                                                    data={transformedData}
                                                    margin={{
                                                        top: 5,
                                                        right: 30,
                                                        left: 20,
                                                        bottom: 5,
                                                    }}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="x" scale="time" label="x" tickFormatter={this.formatTick}/>
                                                    <YAxis dataKey="y" scale="linear" />
                                                    <Tooltip/>
                                                    {lines}
                                                    <Line type="monotone" dataKey="y" stroke="green" />

                                                </LineChart>)
                                        } else {
                                            return <EmptyState />;
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
                FROM NrUsage SELECT sum(usage) FACET metric SINCE 1 week ago
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
