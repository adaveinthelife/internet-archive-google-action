const {expect} = require('chai');
const sinon = require('sinon');

const mockApp = require('../../../_utils/mocking/platforms/app');

const builder = require('../../../../src/platform/assistant/handler/builder');

describe('platform', () => {
  describe('assistant', () => {
    it('should populate intent handlers without states', () => {
      const actionsMap = new Map([
        ['welcome', {default: sinon.spy}],
        ['hello', {default: sinon.spy}],
      ]);
      const res = builder({actionsMap});
      expect(res).to.have.lengthOf(2);
      expect(res[0]).to.have.property('intent', 'welcome');
      expect(res[1]).to.have.property('intent', 'hello');
    });

    describe('with state', () => {
      let actionsMap;
      let app;
      let helloHandlers;
      let welcomeHandlers;

      beforeEach(() => {
        app = mockApp();

        helloHandlers = {
          default: sinon.spy(),
        };

        welcomeHandlers = {
          default: sinon.spy(),
          playback: sinon.spy(),
        };

        actionsMap = new Map([
          ['welcome', welcomeHandlers],
          ['hello', helloHandlers],
        ]);
      });

      it('should populate intent handlers with states', () => {
        const res = builder({actionsMap});
        expect(res).to.have.lengthOf(2);
        expect(res[0]).to.have.property('intent', 'welcome');
        expect(res[1]).to.have.property('intent', 'hello');
      });

      it('should run default handler when state is undefined', () => {
        const res = builder({actionsMap});
        return res[0].handler({
          app,
        })
          .then(() => {
            expect(welcomeHandlers.default).to.have.been.calledWith(app);
          });
      });

      it('should run certain handler when state is defined and we have handler', () => {
        const res = builder({actionsMap});
        app = mockApp({
          getData: {
            fsm: {
              state: 'playback',
            },
          },
        });

        return res[0].handler({
          app,
        })
          .then(() => {
            expect(welcomeHandlers.playback).to.have.been.calledWith(app);
          });
      });

      it(`should run default handler when state is defined but we don't have handler`, () => {
        const res = builder({actionsMap});
        app = mockApp({
          getData: {
            fsm: {
              state: 'unknown',
            },
          },
        });

        return res[0].handler({
          app,
        })
          .then(() => {
            expect(welcomeHandlers.default).to.have.been.calledWith(app);
          });
      });
    });
  });
});
