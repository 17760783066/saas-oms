import React, { Component } from 'react';
import { Row, Col, Avatar, Button, Card, Dropdown, Menu, message, Modal, Table, Tag, Descriptions, Select, Input } from 'antd';

import BreadcrumbCustom from '../BreadcrumbCustom';

import { App, CTYPE, U, Utils } from "../../common";
import { DownOutlined, UserAddOutlined, UserOutlined } from '@ant-design/icons';
import MerchantUtils from './MerchantUtils';
import copy from '_copy-to-clipboard@3.3.1@copy-to-clipboard';
import { now } from 'lodash-es';




const { Search } = Input;

class MerchantList extends Component {
    constructor(props) {
        super(props);
        this.state = {

            merchantQo: {
                expireDay: parseInt(this.props.match.params.expireDay),
            },
            merchantList: [],
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
    }

    componentWillReceiveProps(np) {
        this.setState({ merchantQo: { expireDay: parseInt(np.match.params.expireDay) } }, this.loadData)
    }


    loadData = () => {
        let { merchantQo = {}, pagination, } = this.state;

        let { expireDay } = merchantQo;

        this.setState({ loading: true });
        App.api('adm/merchant/merchant-list', {
            merchantQo: JSON.stringify({
                ...merchantQo,
                expireBefore: expireDay > 0 ? { after: new Date().getTime() + 86400000 * expireDay } : null,
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
        let { pagination = {}, merchantQo = {} } = this.state;
        if (key) {
            merchantQo[key] = value;
        }
        this.setState(
            {
                merchantQo,
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
    // reloadData = (kv) => {
    //     let { pagination = {} } = this.state;

    //     for (let key in kv) {
    //         if ({}.hasOwnProperty.call(kv, key)) {
    //             this.state[key] = kv[key];
    //         }
    //     }

    //     this.setState(
    //         {
    //             pagination: {
    //                 ...pagination,
    //                 current: 1,
    //             },
    //         },
    //         this.loadData
    //     );
    // };

    edit = merchant => {
        App.go(`/app/merchant/merchant-edit/${merchant.id}`)
    };
    copyUrl = (id) => {
        copy(App.MERCHANT_PORTAL + '?id=' + U.base64.encode(id.toString()));
        message.success('????????????????????????');
    };


    render() {
        let { merchantQo = {}, list, loading } = this.state;


        let { expireDay } = merchantQo;

        return (
            <div className='common-list'>
                <BreadcrumbCustom first={CTYPE.link.merchant_list.txt} />
                <Card>

                    <Row style={{ marginBottom: 10 }}>
                        <Col span={4}>
                            <Button type="primary" icon={<UserAddOutlined />} onClick={() => {
                                this.edit({ id: 0 })
                            }}>????????????</Button>
                        </Col>
                        <Col span={20}>
                            <Select
                                defaultValue='??????'
                                style={{ float: 'right' }}
                                onChange={(value) =>
                                    this.reloadDate('status', value)}>
                                <Option value="0">??????</Option>
                                <Option value="1">??????</Option>
                                <Option value="2">??????</Option>
                            </Select>
                            <Select
                                value={expireDay}
                                style={{ float: 'right' ,marginRight:'10px'}}
                                onChange={(expireDay) =>
                                    this.reloadDate('expireDay', expireDay)}>
                                <Option value={0}>???????????????</Option>
                                <Option value={7}>7 days</Option>
                                <Option value={30}>30 days</Option>
                            </Select>
                            <Search
                                style={{ width: '300px',float:'right',marginRight:'10px' }}
                                placeholder="?????????????????????????????????"
                                onSearch={(val) => {
                                    this.reloadDate("nameOrMobile", val);
                                }
                                }
                            />
                        </Col>
                    </Row>


                    <Table
                        columns={[{
                            title: '??????',
                            dataIndex: 'id',
                            align: 'center',
                            width: '80px',
                            render: (col, row, i) => i + 1
                        }, {
                            title: '??????',
                            dataIndex: 'cover',
                            align: 'center',
                            width: '100px',
                            render: cover => <Avatar shape="square" src={cover} size={40} icon={<UserOutlined />} />
                        }, {
                            title: '??????',
                            dataIndex: 'name',
                            align: 'center',
                            render: (name, merchant,) => {
                                return <a onClick={() => { MerchantUtils.message(merchant.id, this.loadData) }}>{name}</a>
                            }
                        }, {
                            title: '?????????',
                            dataIndex: 'mobile',
                            align: 'center',
                            render: (mobile) => mobile

                        }, {
                            title: '????????????',
                            dataIndex: 'validThru',
                            align: 'center',
                            width: '160px',
                            render: (t) => <span style={{ color: t < new Date().getTime() + 2592000000 ? 'red' : '' }}>{t ? U.date.format(new Date(t), 'yyyy-MM-dd HH:mm') : '-/-'} </span>
                        
                        }, {

                            title: '????????????',
                            dataIndex: 'createdAt',
                            align: 'center',
                            width: '160px',
                            render: (t) => t ? U.date.format(new Date(t), 'yyyy-MM-dd HH:mm') : '-/-'
                           },
                        {
                            title: '??????',
                            dataIndex: 'status',
                            align: 'center',
                            render: (status) => Utils.getStatus(status).tag
                        }, {
                            title: '??????',
                            dataIndex: 'option',
                            align: 'center',
                            width: '100px',
                            render: (obj, merchant, index) => {
                                return <Dropdown overlay={<Menu>
                                    <Menu.Item key="1">
                                        <a onClick={() => this.edit(merchant)}>??????</a>
                                    </Menu.Item>
                                    <Menu.Divider />
                                    <Menu.Item key="2">
                                        <a onClick={() => this.remove(merchant.id, index)}>??????</a>
                                    </Menu.Item>
                                    <Menu.Item key="3">
                                        <a onClick={() => { MerchantUtils.admAdd(merchant) }}>?????????????????????</a>
                                    </Menu.Item>
                                    <Menu.Divider />
                                    <Menu.Item key="4">
                                        <a onClick={() => this.copyUrl(merchant.id)}>??????????????????</a>

                                    </Menu.Item>
                                    <Menu.Item key="5">
                                        <a onClick={() => { MerchantUtils.duration(merchant.id) }}>??????/??????</a>

                                    </Menu.Item>
                                </Menu>} trigger={['click']}>
                                    <a className="ant-dropdown-link">
                                        ?????? <DownOutlined />
                                    </a>
                                </Dropdown>
                            }

                        }]}
                        rowKey={(item) => item.id}
                        dataSource={list}
                        pagination={false}
                        loading={loading}
                    />
                </Card>
            </div >
        );
    }
}

export default MerchantList;