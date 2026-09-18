"""Start Vmap with real inference through local 9router, never mock fallback."""
import os
import argparse
import uvicorn


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--port', type=int, default=4173)
    parser.add_argument('--model', default=os.getenv('VMAP_MODEL') or os.getenv('NINE_ROUTER_MODEL') or 'Test')
    args = parser.parse_args()
    os.environ['VMAP_AGENT_MODE'] = 'live'
    os.environ['VMAP_MODEL'] = args.model
    os.environ.setdefault('VMAP_MODEL_BASE_URL', os.getenv('NINE_ROUTER_BASE_URL') or 'http://127.0.0.1:20128/v1')
    if not os.getenv('VMAP_MODEL_API_KEY') and os.getenv('NINE_ROUTER_API_KEY'):
        os.environ['VMAP_MODEL_API_KEY'] = os.environ['NINE_ROUTER_API_KEY']
    uvicorn.run('backend.app:app', host='127.0.0.1', port=args.port)


if __name__ == '__main__':
    main()
