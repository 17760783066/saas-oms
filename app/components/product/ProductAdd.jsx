import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Card, Button, Form, TreeSelect, Input, Divider, Tabs, message, InputNumber, Switch } from 'antd';
import { App, CTYPE, U, Utils } from '../../common';
import BreadcrumbCustom from '../BreadcrumbCustom';
import { BookOutlined, PlusOutlined, MinusOutlined, LeftOutlined, DeleteOutlined, RightOutlined } from '_@ant-design_icons@4.7.0@@ant-design/icons';
import '../../assets/css/common/product-add.scss';
import HtmlEditor from "../../common/HtmlEditor";
import ProductUtils from './ProductUtils';

const FormItem = Form.Item;
const { TabPane } = Tabs;
const { Meta } = Card;
const InputGroup = Input.Group;

class ProductAdd extends Component {
    constructor(props) {
        super(props);
        this.state = {
            id: parseInt(this.props.match.params.id),
            productTemplate: {},
            categories: [],
            activeIndex: 0,

        }
    }
    componentDidMount() {
        this.loadData()
    }
    loadData = () => {
        let { id } = this.state;
        this.setState({ loading: true });
        id > 0 && App.api('adm/product/product_template', {
            id
        }).then((productTemplate) => {
            let { specs = [] } = productTemplate;
            specs.map((item) => {
                item.price = (item.price / 100) || 0;
            });
            this.setState({
                productTemplate
            });
        });
        App.api('adm/product/categories').then((categories) => {

            categories.map((item) => {
                let { children = [] } = item;
                children.map((item) => {
                    item.disabled = true;
                })
                item.disabled = true;
            })

            this.setState({
                categories
            })
        });
    };
    handleSubmit = () => {

        let { productTemplate = {} } = this.state;
        let { specs = [], params = [], status, name, categoryId } = productTemplate;
        if (U.str.isEmpty(name)) {
            message.warn('???????????????');
            return;
        }

        if (categoryId === 0) {
            message.warn('???????????????');
            return;
        }

        let index_error = -1;
        let error = '';

        let snos = [];
        specs.map((item, index) => {

            let { imgs = [], params = [], sno } = item;

            if (imgs.length === 0) {
                message.warn('???????????????');
                return;
            }

            if (params.length === 0) {
                index_error = index;
                error = `???????????????`;
            }

            if (U.str.isEmpty(sno)) {
                index_error = index;
                error = `???????????????`;
            }
            snos.push(sno);
        });

        if (index_error > -1) {
            message.warn(`???${index_error + 1}????????????????????????${error}`);
            return;
        }
        snos = U.array.unique(snos);
        if (snos.length !== specs.length) {
            message.warn('??????????????????');
            return;
        }

        let index_error_param = -1;
        let error_param = '';
        params.map((item, index) => {
            let { label, value } = item;
            if (U.str.isEmpty(label) || U.str.isEmpty(value)) {
                index_error_param = index;
                error_param = `???????????????`;
            }
        });

        if (index_error_param > -1) {
            message.warn(`???${index_error_param + 1}??????????????????????????????${error_param}`);
            return;
        }

        if (U.str.isEmpty(status)) {
            productTemplate.status = 2;
        }
        this.setState({ saving: true });
        App.api('adm/product/save_template', {
            productTemplate: JSON.stringify({
                ...productTemplate,
                specs: specs.map((item) => {
                    return {
                        ...item,
                        price: U.toFixed(item.price * 100, 2)
                    }
                })
            })
        }).then((res) => {
            this.setState({ saving: false });
            message.success('?????????');
            window.history.back();
        }, () => {
            this.setState({ saving: false });
        });
    };

    syncPoster = (img, index) => {
        this.doImgOpt(index, 0, 'add', img);
    };

    doImgOpt = (index, index2, opt, img) => {
        let { productTemplate = {} } = this.state;
        let { specs = [{}] } = productTemplate;

        let imgs = specs[index].imgs || [];

        if (opt === 'left') {
            if (index2 === 0) {
                message.warn('??????????????????');
                return;
            }
            imgs = U.array.swap(imgs, index2, index2 - 1);
        } else if (opt === 'right') {
            if (index2 === imgs.length - 1) {
                message.warn('?????????????????????');
                return;
            }
            imgs = U.array.swap(imgs, index2, index2 + 1);
        } else if (opt === 'remove') {
            imgs = U.array.remove(imgs, index2);
        } else if (opt === 'add') {
            imgs.push(img);
        }
        specs[index].imgs = imgs;
        this.setState({
            productTemplate: {
                ...productTemplate,
                specs
            }
        });
    };

    doSpecOpt = (index, action) => {
        let { productTemplate = {}, activeIndex } = this.state;
        let { specs = [] } = productTemplate;

        if (action === 'add') {
            specs.push({});
            activeIndex = specs.length - 1;
        } else if (action === 'remove') {
            specs = U.array.remove(specs, index);
        }
        this.setState({
            productTemplate: {
                ...productTemplate,
                specs
            },
            activeIndex
        });
    };

    render() {
        let { productTemplate, categories = [], activeIndex } = this.state;
        let { name, specs = [{}], params = [{ label: '', value: '' }], status, content, categoryId } = productTemplate;
        return (
            <div className="common-edit-page">
                <BreadcrumbCustom
                    first={<Link to={CTYPE.link.products_templates.path}>{CTYPE.link.products_templates.txt}</Link>}
                    second='????????????' />
                <Card extra={<Button type="primary" icon={<BookOutlined />} onClick={() => { this.handleSubmit() }}>??????</Button>}>

                    <FormItem {...CTYPE.formItemLayout} required={true} label='??????'>
                        <TreeSelect
                            treeData={categories}
                            showSearch
                            style={{ width: '100%' }}
                            dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                            treeNodeFilterProp="label"
                            placeholder="???????????????"
                            allowClear
                            treeDefaultExpandAll
                            fieldNames={{ label: 'name', key: 'sequence', value: 'id' }}
                            value={categoryId}
                            onChange={(v) => {
                                this.setState({
                                    productTemplate: {
                                        ...productTemplate,
                                        categoryId: v
                                    }
                                })
                            }}
                        />
                        {ProductUtils.renderCateTags(categoryId, categories)}

                    </FormItem>
                    <FormItem {...CTYPE.formItemLayout} required={true} label='??????'>
                        <Input value={name} placeholder='???????????????,???????????????' maxLength={10} style={{ width: '300px' }}
                            onChange={(e) => {
                                this.setState({
                                    productTemplate: {
                                        ...productTemplate,
                                        name: e.target.value
                                    }
                                })
                            }}
                        />
                    </FormItem>
                    <FormItem {...CTYPE.formItemLayout} required={true} label='????????????'>
                        <div>
                            <Tabs
                                onChange={(activeIndex) => {
                                    this.setState({ activeIndex });
                                }}
                                activeKey={activeIndex.toString()}
                                type="editable-card"
                                onEdit={this.doSpecOpt}
                            >
                                {specs.map((spec, index) => {
                                    let { imgs = [], params = [{ label: '', value: '' }], price, sno } = spec;
                                    return <TabPane tab={`?????? ${index + 1}`} key={index} closable={index > 0}>
                                        <Card title={<span className='required'>??????</span>} size='small'>
                                            <div className='imgs-opt-block'>

                                                {imgs.map((img, index2) => {
                                                    return <Card key={index2} className='img-card-edit'
                                                        cover={<img src={img} />}
                                                        actions={[
                                                            <Card style={{ height: 30 }}>
                                                                <LeftOutlined
                                                                    onClick={() => this.doImgOpt(index, index2, 'left')} />
                                                                <Divider type="vertical" />
                                                                <DeleteOutlined
                                                                    onClick={() => this.doImgOpt(index, index2, 'remove')} />
                                                                <Divider type="vertical" />
                                                                <RightOutlined
                                                                    onClick={() => this.doImgOpt(index, index2, 'right')} />
                                                            </Card>
                                                        ]}
                                                    />
                                                })}

                                                {imgs.length < 6 &&
                                                    <Card cover={<div className='up-icon' />}
                                                        className={'img-card-add'} onClick={() => {
                                                            Utils.common.showImgEditor(CTYPE.imgeditorscale.rectangle_h, null, (img) => this.syncPoster(img, index));
                                                        }}>
                                                        <Meta description='??????750*422,??????1M .jpg???.png??????' />
                                                    </Card>}
                                            </div>
                                        </Card>

                                        <div className='clearfix-h20' />

                                        <Card title={<span className='required'>??????</span>} size='small'>
                                            {params.map((param, i) => {
                                                let { label, value } = param;
                                                return <InputGroup compact key={i} style={{ marginBottom: '5px' }}>

                                                    <Input style={{ width: 150 }} placeholder="?????????" value={label}
                                                        onChange={(e) => {
                                                            params[i] = { label: e.target.value, value };
                                                            specs[index].params = params;
                                                            this.setState({
                                                                productTemplate: {
                                                                    ...productTemplate, specs
                                                                }
                                                            });
                                                        }} />

                                                    <Input style={{ width: 500 }} placeholder="????????????" value={value}
                                                        onChange={(e) => {
                                                            params[i] = { label, value: e.target.value };
                                                            specs[index].params = params;
                                                            this.setState({
                                                                productTemplate: {
                                                                    ...productTemplate, specs
                                                                }
                                                            });
                                                        }} />

                                                    {params.length !== 1 &&
                                                        <Button type='danger' icon={<MinusOutlined />}
                                                            onClick={() => {
                                                                params = U.array.remove(params, i);
                                                                specs[index].params = params;
                                                                this.setState({
                                                                    productTemplate: {
                                                                        ...productTemplate, specs
                                                                    }
                                                                });
                                                            }} />}

                                                    {i === params.length - 1 && params.length < 2 &&
                                                        <Button type='primary' icon={<PlusOutlined />} style={{ marginLeft: '2px' }}
                                                            onClick={() => {
                                                                if (params.length < 2) {
                                                                    params.push({ label: '', value: '' });
                                                                    specs[index].params = params;
                                                                    this.setState({
                                                                        productTemplate: {
                                                                            ...productTemplate, specs
                                                                        }
                                                                    });
                                                                } else {
                                                                    message.warning('????????????2???');
                                                                }
                                                            }} />}
                                                </InputGroup>
                                            })}
                                        </Card>
                                        <div className='clearfix-h20' />
                                        <Card title={<span className='required'>??????</span>} size='small'>
                                            <FormItem required={true} {...CTYPE.formItemLayout} label='????????????'>
                                                <InputNumber value={price} min={0} precision={2} onChange={(value) => {
                                                    specs[index].price = value;
                                                    this.setState({
                                                        productTemplate: {
                                                            ...productTemplate, specs
                                                        }
                                                    });
                                                }} />
                                            </FormItem>

                                            <FormItem required={true} {...CTYPE.formItemLayout} label='??????'>
                                                <Input style={{ width: 100 }}
                                                    value={sno} min={0} onChange={(e) => {
                                                        specs[index].sno = e.target.value;
                                                        this.setState({
                                                            productTemplate: {
                                                                ...productTemplate, specs
                                                            }
                                                        });
                                                    }} />
                                            </FormItem>
                                        </Card>
                                    </TabPane>
                                })}
                            </Tabs>
                        </div>
                    </FormItem>
                    <FormItem {...CTYPE.formItemLayout} required={true} label='????????????'>
                        {params.map((param, i) => {
                            let { label, value } = param;
                            return <InputGroup compact key={i} style={{ marginBottom: '5px' }}>

                                <Input style={{ width: 150 }} placeholder="?????????" value={label}
                                    onChange={(e) => {
                                        params[i] = { label: e.target.value, value };
                                        this.setState({
                                            productTemplate: {
                                                ...productTemplate, params
                                            }
                                        });
                                    }} />

                                <Input style={{ width: 500 }} placeholder="????????????" value={value}
                                    onChange={(e) => {
                                        params[i] = { label, value: e.target.value };
                                        this.setState({
                                            productTemplate: {
                                                ...productTemplate, params
                                            }
                                        });
                                    }} />

                                {params.length !== 1 &&
                                    <Button type='danger' icon={<MinusOutlined />}
                                        onClick={() => {
                                            params = U.array.remove(params, i);
                                            this.setState({
                                                productTemplate: {
                                                    ...productTemplate, params
                                                }
                                            });
                                        }} />}

                                {i === params.length - 1 &&
                                    <Button type='primary' icon={<PlusOutlined />} style={{ marginLeft: '2px' }}
                                        onClick={() => {
                                            if (params.length < 100) {
                                                params.push({ label: '', value: '' });
                                                this.setState({
                                                    productTemplate: {
                                                        ...productTemplate, params
                                                    }
                                                });
                                            } else {
                                                message.warning('????????????100???');
                                            }
                                        }} />}
                            </InputGroup>
                        })}
                    </FormItem>
                    <FormItem
                        required={true}
                        {...CTYPE.formItemLayout} label='??????'>
                        <Switch checked={status === 1} onChange={(chk) => {
                            this.setState({
                                productTemplate: {
                                    ...productTemplate,
                                    status: chk ? 1 : 2
                                }
                            })
                        }} />
                    </FormItem>

                    <FormItem
                        {...CTYPE.formItemLayout}
                        label="????????????">
                        <HtmlEditor content={content} syncContent={(content) => {
                            this.setState({
                                productTemplate: {
                                    ...productTemplate,
                                    content
                                }
                            })
                        }} />
                    </FormItem>
                </Card>
            </div>
        );
    }
}

export default ProductAdd;