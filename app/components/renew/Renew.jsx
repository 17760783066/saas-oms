import { DownOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Card, Col, DatePicker, Dropdown, Menu, message, Row, Select, Table } from 'antd';
import React, { Component } from 'react';
import { App, CTYPE, U, Utils } from '../../common';
import BreadcrumbCustom from '../BreadcrumbCustom';
import SuggestItems from '../common/SuggestItems';
import RenewUtils from './RenewUtils';
const { RangePicker } = DatePicker;

class Renew extends Component {
    constructor(props) {
        super(props);
        this.state = {
            renew: [],
            loading: false,

            pagination: {
                pageSize: CTYPE.pagination.pageSize,
                current: 0,
                total: 0
            },

        }
    }
    componentDidMount() {
        this.loadData();
        this.props.loadData;

    }
    loadData = () => {
        let { renewQo, pagination ,queryBetween={}} = this.state;
        let { before = 0, after = 0 } = queryBetween;
        if (before != 0 && after != 0) {
            renewQo["createdAt"] = queryBetween;
        }


        this.setState({ loading: true });
        App.api('adm/renew/renews', {
            renewQo: JSON.stringify({
                ...renewQo,
                pageNumber: pagination.current,
                pageSize: pagination.pageSize
            })

        }).then((ret) => {
            let pagination = Utils.pager.convert2Pagination(ret);
            let { content = [] } = ret;
            this.setState({
                list: content,
                pagination,
                loading: false
            });
        });

    };

    reloadDate = (key, value) => {
        let { pagination = {}, renewQo = {} } = this.state;
        if (key) {
            renewQo[key] = value;
        }
        this.setState(
            {
                renewQo,
                pagination: {
                    ...pagination,
                    current: 1,
                },
            },
            () => {
                this.loadData();
            }
        );
    };

    parseDateStart = (t) => {

        let date = new Date();
        let d = new Date(t);
        date.setFullYear(d.getFullYear());
        date.setMonth(d.getMonth());
        date.setDate(d.getDate());
        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
        date.setMilliseconds(0);

        return date.getTime();
    }

    parseDateEnd = (t) => {

        let date = new Date();
        let d = new Date(t);
        date.setFullYear(d.getFullYear());
        date.setMonth(d.getMonth());
        date.setDate(d.getDate());
        date.setHours(23);
        date.setMinutes(59);
        date.setSeconds(59);
        date.setMilliseconds(999);

        return date.getTime();
    }
    render() {
        let { list, loading, status } = this.state;
        return (
            <div>
                <div className='common-list'>
                    <BreadcrumbCustom first={CTYPE.link.renews.txt} />
                    <Card >

                        <Row style={{ marginBottom: 10 }}>
                            <Col span={16}>
                                <Select
                                    defaultValue='??????'
                                    style={{ width: 120 }}
                                    onChange={(value) =>
                                        this.reloadDate('status', value)}>
                                    <Option value="0">??????</Option>
                                    <Option value="1">?????????</Option>
                                    <Option value="2">????????????</Option>
                                    <Option value="3">????????????</Option>
                                </Select>
                                <Select
                                    defaultValue='????????????'
                                    style={{ width: 120 }}
                                    onChange={(value) =>
                                        this.reloadDate('status', value)}>
                                    <Option value="0">????????????</Option>
                                    <Option value="1">?????????</Option>
                                    <Option value="2">??????</Option>
                                    <Option value="3">?????????</Option>
                                </Select>
                                <RangePicker style={{ width: '250px', float: 'right' }} bordered={false}
                                    onChange={(vs) => {
                                        this.reloadDate('createdAt',  vs==null?null: { after: this.parseDateStart(vs[0].valueOf()), before: this.parseDateEnd(vs[1].valueOf()) })
                                    }} />
                            </Col>
                            <Col span={2}></Col>
                            <Col span={6}>
                                <SuggestItems type='merchant' syncItem={(merchant) => {
                                    this.reloadDate('merchantId', merchant.id);
                                }} />
                            </Col>
                        </Row>
                        <Table
                            columns={[{
                                title: '??????',
                                dataIndex: 'id',
                                align: 'center',
                                render: (col, row, i) => i + 1
                            }, {
                                title: '????????????',
                                dataIndex: 'payImg',
                                align: 'center',
                                render: payImg => <Avatar shape="square" src={payImg} size={40} icon={<UserOutlined />} />
                            }, {
                                title: '????????????',
                                dataIndex: ['merchant', 'name'],
                                align: 'center',
                            }, {
                                title: '????????????',
                                dataIndex: 'renewType',
                                align: 'center',
                                render: (renewType) => Utils.getRenewType(renewType).tag
                            }, {
                                title: '????????????',
                                dataIndex: 'duration',
                                align: 'center',
                                render: (duration) => Utils.duration2DateStr(duration)
                            }, {
                                title: '????????????',
                                dataIndex: 'createdAt',
                                align: 'center',
                                render: (t) => t ? U.date.format(new Date(t), 'yyyy-MM-dd HH:mm') : '-/-'
                            }, {
                                title: '???????????????',
                                dataIndex: ['admin', 'name'],
                                align: 'center',
                            },
                            {
                                title: '??????',
                                dataIndex: 'status',
                                align: 'center',
                                render: (status) => Utils.getStatusRenew(status).tag
                            }, {
                                title: '????????????',
                                dataIndex: 'payType',
                                align: 'center',
                                render: (payType) => Utils.getPayType(payType).tag
                            }, {
                                title: '????????????',
                                dataIndex: 'amount',
                                align: 'center',
                                render: (amount) => {
                                    return amount ? (
                                        <span>
                                            {` ${parseFloat(amount / 100).toFixed(2)}`.replace(
                                                /\B(?=(\d{3})+(?!\d))/g,
                                                ","
                                            )}
                                        </span>
                                    ) : (
                                        <span>-/-</span>
                                    );
                                },
    
                            }, {
                                title: '??????',
                                dataIndex: 'remark',
                                align: 'center',
                            }, {
                                title: '????????????',
                                dataIndex: 'auditAt',
                                align: 'center',
                                render: (t) => t ? U.date.format(new Date(t), 'yyyy-MM-dd HH:mm') : '-/-'
                            }, {
                                title: '???????????????',
                                dataIndex: ['admin', 'name'],
                                align: 'center',
                            }, {
                                title: '??????',
                                dataIndex: 'option',
                                align: 'center',
                                render: (obj, renew, index) => {
                                    return renew.status == 1 ? <a onClick={() => { RenewUtils.option(renew.id, this.loadData) }}>??????</a> : '--'
                                }
                            }

                            ]}
                            rowKey={(item) => item.id}
                            dataSource={list}
                            pagination={false}
                            loading={loading}
                        />
                    </Card>
                </div >
            </div>
        );
    }
}

export default Renew;