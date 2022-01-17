import { BadRequestException } from '@nestjs/common';
import { TrimPipe } from './trim.pipe';

describe('Trim Pipe', () => {
  let trimPipe: TrimPipe;

  beforeEach(() => {
    trimPipe = new TrimPipe();
  });

  it('should trim value', () => {
    const values = {
      password: '  password  ',
      title: '  Hello world  ',
      todo: {
        title: '  Hello world  ',
      },
    };
    const metadata = {
      type: 'body',
    };
    expect(trimPipe.transform(values, metadata as any)).toEqual({
      password: '  password  ',
      title: 'Hello world',
      todo: {
        title: 'Hello world',
      },
    });
  });

  it('should not trim values because of metadata', () => {
    const values = {
      password: '  password  ',
      title: '  Hello world  ',
      todo: {
        title: '  Hello world  ',
      },
    };
    const metadata = {
      type: 'custom',
    };
    expect(trimPipe.transform(values, metadata as any)).toEqual({
      password: '  password  ',
      title: '  Hello world  ',
      todo: {
        title: '  Hello world  ',
      },
    });
  });

  it('should not trim values because it does not trim string which are not properties of an object', () => {
    const values = '  Hello world  ';
    const metadata = {
      type: 'body',
    };
    expect(trimPipe.transform(values, metadata as any)).toEqual(
      '  Hello world  ',
    );
  });

  it('should throw because it does not validate null', () => {
    const values = null;
    const metadata = {
      type: 'body',
    };
    expect(() => trimPipe.transform(values, metadata as any)).toThrow(
      BadRequestException,
    );
  });
});
