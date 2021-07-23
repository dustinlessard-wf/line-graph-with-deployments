import React from 'react';
import PropTypes from 'prop-types';
import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
} from 'recharts';
import { Card, CardBody, HeadingText, NrqlQuery, Spinner, Steps, StepsItem, AutoSizer } from 'nr1';



export default class BetterBillboardVisualization extends React.Component {
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


    render() {
        const { conditionalFormatting, settings } = this.props;

        return (
            <AutoSizer>
                {({ width, height }) => (
                    <NrqlQuery
                        query={settings.query}
                        accountId={parseInt(settings.accountId)}
                        pollInterval={NrqlQuery.AUTO_POLL_INTERVAL}
                    >
                        {({ data, loading, error }) => {
                            console.log(data);

                            if (loading) {
                                return <Spinner />;
                            }

                            if (error) {
                                return <ErrorState />;
                            }
                            let y = Number.parseFloat(data[0].data[0].y).toPrecision(Number.parseInt(settings.precision)) //Number.parseFloat(x).toPrecision(4);
                            let label = settings.label;
                            let unit = settings.unit;
                            let color = 'black';

                            console.log(conditionalFormatting);

                            let shouldReturn = false;
                            for (let i = 0; i < conditionalFormatting.length; i++) {
                                let rule = conditionalFormatting[i];
                            
                                let comparevalue = Number.parseFloat(rule.valueString);
                                
                                switch (rule.operator) {
                                    case '>':
                                        if (y > comparevalue) {
                                            color = rule.color;
                                            shouldReturn = true;
                                        }
                                        break;
                                    case '>=':
                                        if (y >= comparevalue) {
                                            color = rule.color;
                                            shouldReturn = true;
                                        }
                                        console.log(`Comparing ${y} with ${comparevalue}; color: ${color}`);
                                        break;
                                    case '==':
                                        if (y == rule.valueString) {
                                            color = rule.color;
                                            shouldReturn = true;
                                        }
                                        break;
                                    case '<=':
                                        if (y <= rule.valueString) {
                                            color = rule.color;
                                            shouldReturn = true;
                                        }
                                        break;
                                    case '<':
                                        if (y <= rule.valueString) {
                                            color = rule.color;
                                            shouldReturn = true;
                                        }
                                        break;
                                    default:
                                        color = 'grey';
                                }
                                if(shouldReturn==true){break;}
                            }

                            const valueStyle = {
                                fontSize: '110px',
                                display: 'inline-block',
                                color: color
                            };
                            const labelStyle = {
                                fontSize: '36px',
                                display: 'block',
                                color: color
                            }

                            return (
                                <div>
                                    <span style={valueStyle}>{y}&nbsp;{unit}</span>
                                    <span style={labelStyle}>{label}</span>
                                </div>

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
            <Steps>
                <StepsItem label="Add your data">
                    Connect your data to New Relic and gain insights in 5 minutes.
                </StepsItem>
                <StepsItem label="Explore your data" checked>
                    Traverse your entire stack in one place.
                </StepsItem>
                <StepsItem label="Monitor critical workflows">
                    Detect outages and poor performance before your users notice.
                </StepsItem>
                <StepsItem label="Configure an alert" checked>
                    Configure an alert and we'll tell you when to worry.
                </StepsItem>
                <StepsItem label="Query your data">
                    Write your first query in our powerful New Relic Query Language (NRQL).
                </StepsItem>
                <StepsItem label="Set up a dashboard">
                    Create and share dashboards that matter to you and your team.
                </StepsItem>
            </Steps>;
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
