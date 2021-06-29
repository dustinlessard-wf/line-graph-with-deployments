import React from 'react';
import PropTypes from 'prop-types';
import {
    Line,
    LineChart,
    CartesianGrid,
    XAxis,
    YAxis,
    ReferenceArea,
    ReferenceLine
} from 'recharts';
import {Card, CardBody, HeadingText, NrqlQuery, Spinner, AutoSizer} from 'nr1';

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

    static theData = [
        {
          name: 'Day 1',
          uv: 4000,
          pv: 2400,
          amt: 2400,
        },
        {
          name: 'Day 2',
          uv: 3000,
          pv: 1398,
          amt: 2210,
        },
        {
          name: 'Day 3',
          uv: 2000,
          pv: 9800,
          amt: 2290,
        },
        {
          name: 'Day 4',
          uv: 2780,
          pv: 3908,
          amt: 2000,
        },
        {
          name: 'Day 5',
          uv: 1890,
          pv: 4800,
          amt: 2181,
        },
        {
          name: 'Day 6',
          uv: 2390,
          pv: 3800,
          amt: 2500,
        },
        {
          name: 'Day 7',
          uv: 3490,
          pv: 4300,
          amt: 2100,
        },
      ];
      

    
     transformData = (rawData) => {
         let list = [];
         rawData[0].data.forEach(item => {
                    list.push({x:new Date(item.x),y:item.y});
                });
         
         return list;
    };

    /**
     * Format the given axis tick's numeric value into a string for display.
     */
    formatTick = (value) => {
        return value.toLocaleString();
    };

    render() {
        const {nrqlQueries, stroke, fill} = this.props;

        const nrqlQueryPropsAvailable =
            nrqlQueries &&
            nrqlQueries[0] &&
            nrqlQueries[0].accountId &&
            nrqlQueries[0].query;

        if (!nrqlQueryPropsAvailable) {
            return <EmptyState />;
        }

        return (
            <AutoSizer>
                {({width, height}) => (
                    <NrqlQuery
                        query={nrqlQueries[0].query}
                        accountId={parseInt(nrqlQueries[0].accountId)}
                        pollInterval={NrqlQuery.AUTO_POLL_INTERVAL}
                    >
                        {({data, loading, error}) => {
                            console.log('data:');
                            console.log(data);
                            
                            var transformedData=[];
                            if(data != null){
                                transformedData = this.transformData(data);
                            }
                            
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
                                <XAxis dataKey="x" scale="time" />
                                <YAxis/>
                                {
                                    <NrqlQuery
                                    query={nrqlQueries[0].query2}
                                    accountId={parseInt(nrqlQueries[0].accountId)}
                                    pollInterval={NrqlQuery.AUTO_POLL_INTERVAL}
                                >
                                    {({data2, loading2, error2}) => {
                                    console.log('data2');
                                        
                                    }}
                                    </NrqlQuery>
                                }
                                <Line type="monotone" dataKey="y" stroke="#8884d8" />
                              </LineChart>
                            );
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
