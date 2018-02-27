import React from 'react';
import ReactDOM from 'react-dom';
import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import ifReact from 'enzyme-adapter-react-helper/build/ifReact';
import PortalWithState from '../src/PortalWithState';

Enzyme.configure({ adapter: new Adapter() });

beforeEach(() => {
  document.body.innerHTML = '<div id="root"></div>';
});

afterEach(() => {
  ReactDOM.unmountComponentAtNode(document.getElementById('root'));
  document.body.innerHTML = '';
});

ifReact('>= 16', test, test.skip)('should not mount portal by default', () => {
  ReactDOM.render(
    <PortalWithState>{({ portal }) => portal('Foo')}</PortalWithState>,
    document.getElementById('root')
  );
  expect(document.body.firstChild.outerHTML).toBe('<div id="root"></div>');
  expect(document.body.lastChild.outerHTML).toBe(
    document.body.lastChild.outerHTML
  );
});

ifReact('< 16', test, test.skip)('should not mount portal by default', () => {
  ReactDOM.render(
    <PortalWithState>{({ portal }) => portal('Foo')}</PortalWithState>,
    document.getElementById('root')
  );
  expect(document.body.firstChild.outerHTML).toBe(
    '<div id="root"><!-- react-empty: 1 --></div>'
  );
  expect(document.body.lastChild.outerHTML).toBe(
    document.body.lastChild.outerHTML
  );
});

ifReact(
  '>= 16',
  test,
  test.skip
)('should mount portal by default with defaultOpen', () => {
  ReactDOM.render(
    <PortalWithState defaultOpen>
      {({ portal }) => portal('Foo')}
    </PortalWithState>,
    document.getElementById('root')
  );
  expect(document.body.firstChild.outerHTML).toBe('<div id="root"></div>');
  expect(document.body.lastChild.outerHTML).toBe('<div>Foo</div>');
});

ifReact(
  '< 16',
  test,
  test.skip
)('should mount portal by default with defaultOpen', () => {
  ReactDOM.render(
    <PortalWithState defaultOpen>
      {({ portal }) => portal(<div>Foo</div>)}
    </PortalWithState>,
    document.getElementById('root')
  );
  expect(document.body.firstChild.outerHTML).toBe(
    '<div id="root"><!-- react-empty: 1 --></div>'
  );
  expect(document.body.lastChild.outerHTML).toBe(
    '<div><div data-reactroot="">Foo</div></div>'
  );
});

ifReact('>= 16', test, test.skip)(
  'should open portal after calling openPortal',
  () => {
    ReactDOM.render(
      <PortalWithState>
        {({ portal, openPortal }) => [
          <button key="trigger" id="trigger" onClick={openPortal}>
            Open
          </button>,
          portal('Foo')
        ]}
      </PortalWithState>,
      document.getElementById('root')
    );
    expect(document.body.firstChild.outerHTML).toBe(
      '<div id="root"><button id="trigger">Open</button></div>'
    );
    expect(document.body.lastChild.outerHTML).toBe(
      document.body.firstChild.outerHTML
    );
    document.getElementById('trigger').click();
    expect(document.body.lastChild.outerHTML).toBe('<div>Foo</div>');
  }
);

ifReact('< 16', test, test.skip)(
  'should open portal after calling openPortal',
  () => {
    ReactDOM.render(
      <PortalWithState>
        {({ portal, openPortal }) => (
          <div>
            <button key="trigger" id="trigger" onClick={openPortal}>
              Open
            </button>
            {portal(<div>Foo</div>)}
          </div>
        )}
      </PortalWithState>,
      document.getElementById('root')
    );

    expect(document.body.firstChild.outerHTML).toBe(
      '<div id="root"><div data-reactroot=""><button id="trigger">Open</button></div></div>'
    );

    expect(document.body.lastChild.outerHTML).toBe(
      document.body.firstChild.outerHTML
    );

    document.getElementById('trigger').click();

    expect(document.body.lastChild.outerHTML).toBe(
      '<div><div data-reactroot="">Foo</div></div>'
    );
  }
);

ifReact(
  '>= 16',
  test,
  test.skip
)('should close portal after calling closePortal', () => {
  ReactDOM.render(
    <PortalWithState defaultOpen>
      {({ portal, closePortal }) => [
        <button key="trigger" id="trigger" onClick={closePortal}>
          Close
        </button>,
        portal('Foo')
      ]}
    </PortalWithState>,
    document.getElementById('root')
  );
  expect(document.body.firstChild.outerHTML).toBe(
    '<div id="root"><button id="trigger">Close</button></div>'
  );
  expect(document.body.lastChild.outerHTML).toBe('<div>Foo</div>');
  document.getElementById('trigger').click();
  expect(document.body.lastChild.outerHTML).toBe(
    document.body.firstChild.outerHTML
  );
});

ifReact(
  '< 16',
  test,
  test.skip
)('should close portal after calling closePortal', () => {
  ReactDOM.render(
    <PortalWithState defaultOpen>
      {({ portal, closePortal }) => (
        <div>
          <button key="trigger" id="trigger" onClick={closePortal}>
            Close
          </button>
          {portal(<div>Foo</div>)}
        </div>
      )}
    </PortalWithState>,
    document.getElementById('root')
  );
  expect(document.body.firstChild.outerHTML).toBe(
    '<div id="root"><div data-reactroot=""><button id="trigger">Close</button><!-- react-empty: 3 --></div></div>'
  );
  expect(document.body.lastChild.outerHTML).toBe(
    '<div><div data-reactroot="">Foo</div></div>'
  );
  document.getElementById('trigger').click();
  expect(document.body.lastChild.outerHTML).toBe(
    document.body.firstChild.outerHTML
  );
});

ifReact('>= 16', test, test.skip)('should set listeners flags', () => {
  const wrapperWithListener = shallow(
    <PortalWithState closeOnEsc closeOnOutsideClick>
      {({ portal }) => portal('Foo')}
    </PortalWithState>
  );
  expect(wrapperWithListener.instance().clickListener).toBe(true);
  expect(wrapperWithListener.instance().keydownListener).toBe(true);

  const wrapperWithoutListeners = shallow(
    <PortalWithState>{({ portal }) => portal('Foo')}</PortalWithState>
  );
  expect(wrapperWithoutListeners.instance().clickListener).toBe(false);
  expect(wrapperWithoutListeners.instance().keydownListener).toBe(false);
});

ifReact(
  '>= 16',
  test,
  test.skip
)('should remove specific listener if nextProps will change', () => {
  const wrapper = shallow(
    <PortalWithState closeOnEsc closeOnOutsideClick>
      {({ portal }) => portal('Foo')}
    </PortalWithState>
  );

  wrapper.setProps({
    closeOnEsc: false
  });

  expect(wrapper.instance().keydownListener).toBe(false);
  expect(wrapper.instance().clickListener).toBe(true);
});

ifReact('< 16', test, test.skip)('should not mount portal by default', () => {
  ReactDOM.render(
    <PortalWithState>{({ portal }) => portal('Foo')}</PortalWithState>,
    document.getElementById('root')
  );
  expect(document.body.firstChild.outerHTML).toBe(
    '<div id="root"><!-- react-empty: 1 --></div>'
  );
  expect(document.body.lastChild.outerHTML).toBe(
    document.body.lastChild.outerHTML
  );
});
